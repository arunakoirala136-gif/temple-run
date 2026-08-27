import { UnityScriptInfo } from '../types';

export const UNITY_SCRIPTS: UnityScriptInfo[] = [
  {
    filename: 'PlayerController.cs',
    title: 'Player Controller (2D Movement, Jump & Slide)',
    description: 'Handles 2D physics jumping, dynamic BoxCollider2D sliding, ground detection, dust particles, and obstacle collision.',
    code: `using UnityEngine;

/// <summary>
/// 2D Player Controller for Endless Runner.
/// Implements responsive jumping, sliding (dynamic collider shrinking),
/// ground detection, and collision events.
/// </summary>
[RequireComponent(typeof(Rigidbody2D))]
[RequireComponent(typeof(BoxCollider2D))]
public class PlayerController : MonoBehaviour
{
    [Header("Movement & Physics")]
    [SerializeField] private float jumpForce = 14f;
    [SerializeField] private float slideDuration = 0.65f;
    [SerializeField] private Transform groundCheck;
    [SerializeField] private float groundCheckRadius = 0.2f;
    [SerializeField] private LayerMask groundLayer;

    [Header("Slide Collider Dimensions")]
    [SerializeField] private Vector2 normalColliderSize = new Vector2(0.8f, 1.6f);
    [SerializeField] private Vector2 normalColliderOffset = new Vector2(0f, 0.8f);
    [SerializeField] private Vector2 slideColliderSize = new Vector2(1.4f, 0.7f);
    [SerializeField] private Vector2 slideColliderOffset = new Vector2(0f, 0.35f);

    [Header("FX & Particles")]
    [SerializeField] private ParticleSystem jumpParticles;
    [SerializeField] private ParticleSystem slideParticles;
    [SerializeField] private ParticleSystem landParticles;

    private Rigidbody2D rb;
    private BoxCollider2D boxCollider;
    private Animator animator;

    private bool isGrounded;
    private bool isSliding;
    private float slideTimer;
    private bool isDead;

    private static readonly int AnimJump = Animator.StringToHash("Jump");
    private static readonly int AnimSlide = Animator.StringToHash("Slide");
    private static readonly int AnimGrounded = Animator.StringToHash("IsGrounded");
    private static readonly int AnimDead = Animator.StringToHash("Dead");

    private void Awake()
    {
        rb = GetComponent<Rigidbody2D>();
        boxCollider = GetComponent<BoxCollider2D>();
        animator = GetComponentInChildren<Animator>();
    }

    private void Start()
    {
        SetNormalCollider();
    }

    private void Update()
    {
        if (isDead || GameManager.Instance == null || GameManager.Instance.CurrentState != GameState.Playing)
            return;

        // Ground Check
        bool wasGrounded = isGrounded;
        isGrounded = Physics2D.OverlapCircle(groundCheck.position, groundCheckRadius, groundLayer);

        if (!wasGrounded && isGrounded && landParticles != null)
        {
            landParticles.Play();
        }

        if (animator != null)
            animator.SetBool(AnimGrounded, isGrounded);

        // --- INPUT HANDLING ---
        // Jump: Space or Up Arrow (or W)
        if ((Input.GetKeyDown(KeyCode.Space) || Input.GetKeyDown(KeyCode.UpArrow) || Input.GetKeyDown(KeyCode.W)) && isGrounded)
        {
            Jump();
        }

        // Slide: Down Arrow or S
        if ((Input.GetKeyDown(KeyCode.DownArrow) || Input.GetKeyDown(KeyCode.S)) && isGrounded && !isSliding)
        {
            StartSlide();
        }

        // Fast Fall if down pressed in air
        if ((Input.GetKeyDown(KeyCode.DownArrow) || Input.GetKeyDown(KeyCode.S)) && !isGrounded)
        {
            rb.linearVelocity = new Vector2(rb.linearVelocity.x, -12f);
        }

        // Slide Timer
        if (isSliding)
        {
            slideTimer -= Time.deltaTime;
            if (slideTimer <= 0f)
            {
                StopSlide();
            }
        }
    }

    public void Jump()
    {
        if (!isGrounded || isDead) return;

        if (isSliding)
            StopSlide();

        rb.linearVelocity = new Vector2(rb.linearVelocity.x, jumpForce);
        if (animator != null) animator.SetTrigger(AnimJump);
        if (jumpParticles != null) jumpParticles.Play();
        SoundManager.Instance?.PlayJump();
    }

    public void StartSlide()
    {
        if (!isGrounded || isSliding || isDead) return;

        isSliding = true;
        slideTimer = slideDuration;

        // Shrink collider to fit under overhead obstacles
        boxCollider.size = slideColliderSize;
        boxCollider.offset = slideColliderOffset;

        if (animator != null) animator.SetBool(AnimSlide, true);
        if (slideParticles != null) slideParticles.Play();
        SoundManager.Instance?.PlaySlide();
    }

    public void StopSlide()
    {
        if (!isSliding) return;

        isSliding = false;
        SetNormalCollider();

        if (animator != null) animator.SetBool(AnimSlide, false);
        if (slideParticles != null) slideParticles.Stop();
    }

    private void SetNormalCollider()
    {
        boxCollider.size = normalColliderSize;
        boxCollider.offset = normalColliderOffset;
    }

    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (isDead) return;

        if (collision.CompareTag("Obstacle") || collision.CompareTag("OverheadObstacle"))
        {
            Die();
        }
    }

    private void OnCollisionEnter2D(Collision2D collision)
    {
        if (isDead) return;

        if (collision.gameObject.CompareTag("Obstacle"))
        {
            Die();
        }
    }

    private void Die()
    {
        if (isDead) return;
        isDead = true;

        rb.linearVelocity = Vector2.zero;
        rb.isKinematic = true;

        if (animator != null) animator.SetTrigger(AnimDead);
        SoundManager.Instance?.PlayHit();
        GameManager.Instance?.GameOver();
    }

    public void ResetPlayer(Vector3 startPos)
    {
        isDead = false;
        isSliding = false;
        transform.position = startPos;
        rb.isKinematic = false;
        rb.linearVelocity = Vector2.zero;
        SetNormalCollider();
    }
}`
  },
  {
    filename: 'ChaserMonster.cs',
    title: 'Chaser Monster (Trailing Beast & Jumpscare / Game Over Lunge)',
    description: 'Controls the pursuing temple beast, trailing the player, breathing fire embers, and lunging when the player collides with an obstacle.',
    code: `using UnityEngine;

/// <summary>
/// Controls the menacing monster chasing right behind the runner.
/// Stays smoothly behind the player during run, lunges forward on Game Over.
/// </summary>
public class ChaserMonster : MonoBehaviour
{
    [Header("Tracking Parameters")]
    [SerializeField] private Transform targetPlayer;
    [SerializeField] private float trailingDistance = 3.5f;
    [SerializeField] private float followSmoothTime = 0.2f;
    [SerializeField] private float lungeSpeed = 12f;

    [Header("Animations & FX")]
    [SerializeField] private ParticleSystem smokeParticles;
    [SerializeField] private ParticleSystem fireRoarParticles;

    private Vector2 currentVelocity;
    private bool isLunging;
    private Animator animator;

    private static readonly int AnimRoar = Animator.StringToHash("Roar");
    private static readonly int AnimBite = Animator.StringToHash("Bite");

    private void Awake()
    {
        animator = GetComponentInChildren<Animator>();
    }

    private void Update()
    {
        if (targetPlayer == null) return;

        if (!isLunging)
        {
            // Smoothly trail behind target player's X position while maintaining Y offset
            Vector2 targetPos = new Vector2(targetPlayer.position.x - trailingDistance, transform.position.y);
            transform.position = Vector2.SmoothDamp(transform.position, targetPos, ref currentVelocity, followSmoothTime);

            // Random idle roar
            if (Random.value < 0.002f && fireRoarParticles != null)
            {
                fireRoarParticles.Play();
                if (animator != null) animator.SetTrigger(AnimRoar);
                SoundManager.Instance?.PlayMonsterRoar();
            }
        }
        else
        {
            // Lunge forward towards caught player
            transform.position = Vector2.MoveTowards(
                transform.position, 
                targetPlayer.position, 
                lungeSpeed * Time.deltaTime
            );
        }
    }

    public void TriggerLunge()
    {
        isLunging = true;
        if (animator != null) animator.SetTrigger(AnimBite);
        if (fireRoarParticles != null) fireRoarParticles.Play();
        SoundManager.Instance?.PlayMonsterRoar();
    }

    public void ResetChaser(Vector3 startPos)
    {
        isLunging = false;
        transform.position = startPos;
        currentVelocity = Vector2.zero;
    }
}`
  },
  {
    filename: 'ObstacleSpawner.cs',
    title: 'Procedural Obstacle & Coin Spawner',
    description: 'Procedurally spawns randomized ground hurdles, ancient totems, overhead slide arches, and coin/gem patterns with dynamic spacing based on game speed.',
    code: `using System.Collections.Generic;
using UnityEngine;

/// <summary>
/// Procedural generator for obstacles, coins, and bonus gems.
/// Spawns varied hazards (Jump/Slide required) at increasing difficulty.
/// </summary>
public class ObstacleSpawner : MonoBehaviour
{
    [Header("Prefabs")]
    [SerializeField] private GameObject[] groundObstaclePrefabs; // Spikes, Totems, Boulders
    [SerializeField] private GameObject[] overheadObstaclePrefabs; // Arches, Blades (Requires Slide)
    [SerializeField] private GameObject coinPrefab;
    [SerializeField] private GameObject gemPrefab;

    [Header("Spawn Distance Settings")]
    [SerializeField] private float minSpawnDistance = 10f;
    [SerializeField] private float maxSpawnDistance = 18f;
    [SerializeField] private float spawnX = 20f;
    [SerializeField] private float groundY = -2f;
    [SerializeField] private float overheadY = 0.5f;

    private float nextSpawnDistance;
    private float distanceCounter;
    private List<GameObject> activeObjects = new List<GameObject>();

    private void Start()
    {
        ResetSpawner();
    }

    private void Update()
    {
        if (GameManager.Instance == null || GameManager.Instance.CurrentState != GameState.Playing)
            return;

        float currentSpeed = GameManager.Instance.CurrentScrollSpeed;
        float frameDist = currentSpeed * Time.deltaTime;
        distanceCounter += frameDist;

        if (distanceCounter >= nextSpawnDistance)
        {
            distanceCounter = 0f;
            SpawnRandomHazardPattern();

            // Difficulty ramp: distance between obstacles shrinks slightly as game speeds up
            float speedFactor = Mathf.Clamp01((currentSpeed - 8f) / 12f);
            float currentMin = Mathf.Lerp(minSpawnDistance, minSpawnDistance * 0.75f, speedFactor);
            float currentMax = Mathf.Lerp(maxSpawnDistance, maxSpawnDistance * 0.75f, speedFactor);
            nextSpawnDistance = Random.Range(currentMin, currentMax);
        }

        // Clean up distant offscreen objects
        for (int i = activeObjects.Count - 1; i >= 0; i--)
        {
            if (activeObjects[i] == null)
            {
                activeObjects.RemoveAt(i);
            }
            else if (activeObjects[i].transform.position.x < -15f)
            {
                Destroy(activeObjects[i]);
                activeObjects.RemoveAt(i);
            }
        }
    }

    private void SpawnRandomHazardPattern()
    {
        bool spawnOverhead = Random.value < 0.4f;

        if (spawnOverhead && overheadObstaclePrefabs.Length > 0)
        {
            // Spawn Overhead Arch / Blade (Must Slide!)
            int idx = Random.Range(0, overheadObstaclePrefabs.Length);
            GameObject obj = Instantiate(overheadObstaclePrefabs[idx], new Vector3(spawnX, overheadY, 0f), Quaternion.identity);
            activeObjects.Add(obj);

            // Spawn low slide coin trail underneath
            SpawnCoinLine(spawnX - 1f, groundY + 0.4f, 3, 1.2f);
        }
        else if (groundObstaclePrefabs.Length > 0)
        {
            // Spawn Ground Spikes / Totem (Must Jump!)
            int idx = Random.Range(0, groundObstaclePrefabs.Length);
            GameObject obj = Instantiate(groundObstaclePrefabs[idx], new Vector3(spawnX, groundY, 0f), Quaternion.identity);
            activeObjects.Add(obj);

            // Spawn high coin arch above the hurdle
            SpawnCoinArch(spawnX, groundY + 1.2f, 5);
        }
    }

    private void SpawnCoinArch(float centerX, float baseY, int count)
    {
        for (int i = 0; i < count; i++)
        {
            float t = (float)i / (count - 1);
            float x = centerX - 2f + (t * 4f);
            float y = baseY + Mathf.Sin(t * Mathf.PI) * 2.2f;

            GameObject prefab = (Random.value < 0.15f && gemPrefab != null) ? gemPrefab : coinPrefab;
            GameObject coin = Instantiate(prefab, new Vector3(x, y, 0f), Quaternion.identity);
            activeObjects.Add(coin);
        }
    }

    private void SpawnCoinLine(float startX, float y, int count, float spacing)
    {
        for (int i = 0; i < count; i++)
        {
            float x = startX + (i * spacing);
            GameObject coin = Instantiate(coinPrefab, new Vector3(x, y, 0f), Quaternion.identity);
            activeObjects.Add(coin);
        }
    }

    public void ResetSpawner()
    {
        foreach (var obj in activeObjects)
        {
            if (obj != null) Destroy(obj);
        }
        activeObjects.Clear();
        distanceCounter = 0f;
        nextSpawnDistance = 6f; // Initial runway
    }
}`
  },
  {
    filename: 'CoinCollectible.cs',
    title: 'Coin & Gem Collectible Component',
    description: 'Handles 3D coin spin, trigger collection by Player, audio chime, sparkle particles, and score incrementation.',
    code: `using UnityEngine;

/// <summary>
/// Collectible Coin/Gem.
/// Detects player collision, awards points, plays sound and particle burst.
/// </summary>
public class CoinCollectible : MonoBehaviour
{
    [SerializeField] private int pointValue = 10;
    [SerializeField] private bool isGem = false;
    [SerializeField] private float rotationSpeed = 180f;
    [SerializeField] private GameObject pickupEffectPrefab;

    private bool collected = false;

    private void Update()
    {
        // 3D spinning visual effect in 2D space
        transform.Rotate(0f, rotationSpeed * Time.deltaTime, 0f);

        // Move with world scroll
        if (GameManager.Instance != null && GameManager.Instance.CurrentState == GameState.Playing)
        {
            transform.Translate(Vector3.left * GameManager.Instance.CurrentScrollSpeed * Time.deltaTime, Space.World);
        }
    }

    private void OnTriggerEnter2D(Collider2D collision)
    {
        if (collected) return;

        if (collision.CompareTag("Player"))
        {
            collected = true;

            if (isGem)
            {
                GameManager.Instance?.AddGem(pointValue);
                SoundManager.Instance?.PlayGem();
            }
            else
            {
                GameManager.Instance?.AddCoin(pointValue);
                SoundManager.Instance?.PlayCoin();
            }

            if (pickupEffectPrefab != null)
            {
                Instantiate(pickupEffectPrefab, transform.position, Quaternion.identity);
            }

            Destroy(gameObject);
        }
    }
}`
  },
  {
    filename: 'ParallaxBackground.cs',
    title: 'Parallax Background Scrolling System',
    description: 'Multi-layer parallax background that scrolls at proportional speeds and seamlessly loops infinitely.',
    code: `using UnityEngine;

/// <summary>
/// Handles infinite parallax scrolling of background layers (Sky, Mountains, Jungle, Ground).
/// </summary>
public class ParallaxBackground : MonoBehaviour
{
    [System.Serializable]
    public class ParallaxLayer
    {
        public Transform layerTransform;
        public float speedMultiplier = 0.5f;
        public float textureWidth = 20f;
    }

    [SerializeField] private ParallaxLayer[] layers;

    private void Update()
    {
        if (GameManager.Instance == null || GameManager.Instance.CurrentState != GameState.Playing)
            return;

        float baseSpeed = GameManager.Instance.CurrentScrollSpeed;

        foreach (var layer in layers)
        {
            if (layer.layerTransform == null) continue;

            float moveAmount = baseSpeed * layer.speedMultiplier * Time.deltaTime;
            layer.layerTransform.position += Vector3.left * moveAmount;

            // Infinite wrapping
            if (layer.layerTransform.position.x <= -layer.textureWidth)
            {
                layer.layerTransform.position += Vector3.right * layer.textureWidth;
            }
        }
    }
}`
  },
  {
    filename: 'GameManager.cs',
    title: 'Game Manager & PlayerPrefs High Score',
    description: 'Master game loop state machine, difficulty scaling formula, distance calculation, high score saving, and restart management.',
    code: `using UnityEngine;
using UnityEngine.SceneManagement;

public enum GameState
{
    Menu,
    Playing,
    Paused,
    GameOver
}

/// <summary>
/// Core Game Manager singleton.
/// Tracks distance, coins, score, difficulty ramping, and PlayerPrefs high score.
/// </summary>
public class GameManager : MonoBehaviour
{
    public static GameManager Instance { get; private set; }

    [Header("Speed & Difficulty Ramping")]
    [SerializeField] private float initialScrollSpeed = 8f;
    [SerializeField] private float maxScrollSpeed = 18f;
    [SerializeField] private float speedIncreaseRate = 0.15f; // Speed units per 100m

    [Header("References")]
    [SerializeField] private PlayerController player;
    [SerializeField] private ChaserMonster chaser;
    [SerializeField] private ObstacleSpawner spawner;
    [SerializeField] private UIManager uiManager;

    public GameState CurrentState { get; private set; } = GameState.Menu;
    public float CurrentScrollSpeed { get; private set; }
    public float DistanceTraveled { get; private set; }
    public int CoinsCollected { get; private set; }
    public int GemsCollected { get; private set; }
    public int CurrentScore => Mathf.FloorToInt(DistanceTraveled) + (CoinsCollected * 10) + (GemsCollected * 50);
    public int HighScore { get; private set; }
    public bool IsNewHighScore { get; private set; }

    private const string HIGH_SCORE_KEY = "TempleRunner_HighScore";

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;

        LoadHighScore();
    }

    private void Start()
    {
        ShowMainMenu();
    }

    private void Update()
    {
        if (CurrentState == GameState.Playing)
        {
            // Advance distance
            DistanceTraveled += CurrentScrollSpeed * Time.deltaTime;

            // Ramp speed based on distance
            CurrentScrollSpeed = Mathf.Min(
                maxScrollSpeed, 
                initialScrollSpeed + (DistanceTraveled / 100f) * speedIncreaseRate
            );

            uiManager?.UpdateHUD(CurrentScore, Mathf.FloorToInt(DistanceTraveled), CoinsCollected, CurrentScrollSpeed);
        }

        // Pause Key (Esc or P)
        if (Input.GetKeyDown(KeyCode.Escape) || Input.GetKeyDown(KeyCode.P))
        {
            if (CurrentState == GameState.Playing) PauseGame();
            else if (CurrentState == GameState.Paused) ResumeGame();
        }
    }

    public void ShowMainMenu()
    {
        CurrentState = GameState.Menu;
        uiManager?.ShowMenu(HighScore);
    }

    public void StartGame()
    {
        CurrentState = GameState.Playing;
        DistanceTraveled = 0f;
        CoinsCollected = 0;
        GemsCollected = 0;
        IsNewHighScore = false;
        CurrentScrollSpeed = initialScrollSpeed;

        player?.ResetPlayer(new Vector3(-4f, -1.2f, 0f));
        chaser?.ResetChaser(new Vector3(-7.5f, -1f, 0f));
        spawner?.ResetSpawner();

        uiManager?.ShowHUD();
        SoundManager.Instance?.StartBGM();
    }

    public void PauseGame()
    {
        if (CurrentState != GameState.Playing) return;
        CurrentState = GameState.Paused;
        Time.timeScale = 0f;
        uiManager?.ShowPause();
        SoundManager.Instance?.PauseBGM();
    }

    public void ResumeGame()
    {
        if (CurrentState != GameState.Paused) return;
        CurrentState = GameState.Playing;
        Time.timeScale = 1f;
        uiManager?.HidePause();
        SoundManager.Instance?.ResumeBGM();
    }

    public void AddCoin(int amount = 1)
    {
        CoinsCollected += amount;
    }

    public void AddGem(int amount = 1)
    {
        GemsCollected += amount;
    }

    public void GameOver()
    {
        if (CurrentState == GameState.GameOver) return;
        CurrentState = GameState.GameOver;

        chaser?.TriggerLunge();
        SoundManager.Instance?.StopBGM();
        SoundManager.Instance?.PlayGameOver();

        int finalScore = CurrentScore;
        if (finalScore > HighScore)
        {
            HighScore = finalScore;
            IsNewHighScore = true;
            SaveHighScore();
        }

        uiManager?.ShowGameOver(finalScore, Mathf.FloorToInt(DistanceTraveled), CoinsCollected, HighScore, IsNewHighScore);
    }

    public void RestartGame()
    {
        Time.timeScale = 1f;
        StartGame();
    }

    private void LoadHighScore()
    {
        HighScore = PlayerPrefs.GetInt(HIGH_SCORE_KEY, 0);
    }

    private void SaveHighScore()
    {
        PlayerPrefs.SetInt(HIGH_SCORE_KEY, HighScore);
        PlayerPrefs.Save();
    }
}`
  },
  {
    filename: 'UIManager.cs',
    title: 'UI Manager (HUD, Main Menu, Game Over Screen)',
    description: 'Coordinates all Canvas UI panels: Main Menu with Best Score, Real-time HUD, and Game Over Screen with restart actions.',
    code: `using UnityEngine;
using UnityEngine.UI;
using TMPro;

/// <summary>
/// Controls all UI Canvases (Main Menu, HUD, Pause, Game Over).
/// </summary>
public class UIManager : MonoBehaviour
{
    [Header("Panels")]
    [SerializeField] private GameObject menuPanel;
    [SerializeField] private GameObject hudPanel;
    [SerializeField] private GameObject pausePanel;
    [SerializeField] private GameObject gameOverPanel;

    [Header("Menu Elements")]
    [SerializeField] private TextMeshProUGUI menuHighScoreText;
    [SerializeField] private Button playButton;

    [Header("HUD Elements")]
    [SerializeField] private TextMeshProUGUI hudScoreText;
    [SerializeField] private TextMeshProUGUI hudDistanceText;
    [SerializeField] private TextMeshProUGUI hudCoinText;
    [SerializeField] private TextMeshProUGUI hudSpeedText;

    [Header("Game Over Elements")]
    [SerializeField] private TextMeshProUGUI finalScoreText;
    [SerializeField] private TextMeshProUGUI finalDistanceText;
    [SerializeField] private TextMeshProUGUI finalCoinText;
    [SerializeField] private TextMeshProUGUI bestScoreText;
    [SerializeField] private GameObject newHighScoreBadge;
    [SerializeField] private Button restartButton;

    private void Awake()
    {
        if (playButton != null)
            playButton.onClick.AddListener(() => GameManager.Instance?.StartGame());

        if (restartButton != null)
            restartButton.onClick.AddListener(() => GameManager.Instance?.RestartGame());
    }

    public void ShowMenu(int highScore)
    {
        menuPanel.SetActive(true);
        hudPanel.SetActive(false);
        pausePanel.SetActive(false);
        gameOverPanel.SetActive(false);

        if (menuHighScoreText != null)
            menuHighScoreText.text = $"BEST: {highScore}";
    }

    public void ShowHUD()
    {
        menuPanel.SetActive(false);
        hudPanel.SetActive(true);
        pausePanel.SetActive(false);
        gameOverPanel.SetActive(false);
    }

    public void UpdateHUD(int score, int distance, int coins, float speed)
    {
        if (hudScoreText != null) hudScoreText.text = score.ToString();
        if (hudDistanceText != null) hudDistanceText.text = $"{distance}m";
        if (hudCoinText != null) hudCoinText.text = coins.ToString();
        if (hudSpeedText != null) hudSpeedText.text = $"{speed:F1}x";
    }

    public void ShowPause()
    {
        pausePanel.SetActive(true);
    }

    public void HidePause()
    {
        pausePanel.SetActive(false);
    }

    public void ShowGameOver(int score, int distance, int coins, int bestScore, bool isNewBest)
    {
        hudPanel.SetActive(false);
        gameOverPanel.SetActive(true);

        if (finalScoreText != null) finalScoreText.text = score.ToString();
        if (finalDistanceText != null) finalDistanceText.text = $"{distance}m";
        if (finalCoinText != null) finalCoinText.text = coins.ToString();
        if (bestScoreText != null) bestScoreText.text = bestScore.ToString();
        if (newHighScoreBadge != null) newHighScoreBadge.SetActive(isNewBest);
    }
}`
  },
  {
    filename: 'SoundManager.cs',
    title: 'Sound Manager (SFX & Audio Sources)',
    description: 'Manages all sound effects (Jump, Slide, Coin, Gem, Hit, Roar, Game Over) and looping background music.',
    code: `using UnityEngine;

/// <summary>
/// Audio Manager singleton for Unity.
/// Plays SFX and dynamically loops background music.
/// </summary>
public class SoundManager : MonoBehaviour
{
    public static SoundManager Instance { get; private set; }

    [Header("Audio Sources")]
    [SerializeField] private AudioSource sfxSource;
    [SerializeField] private AudioSource bgmSource;

    [Header("SFX Clips")]
    [SerializeField] private AudioClip jumpClip;
    [SerializeField] private AudioClip slideClip;
    [SerializeField] private AudioClip coinClip;
    [SerializeField] private AudioClip gemClip;
    [SerializeField] private AudioClip hitClip;
    [SerializeField] private AudioClip roarClip;
    [SerializeField] private AudioClip gameOverClip;

    private void Awake()
    {
        if (Instance != null && Instance != this)
        {
            Destroy(gameObject);
            return;
        }
        Instance = this;
    }

    public void PlayJump() => PlayClip(jumpClip, 0.8f);
    public void PlaySlide() => PlayClip(slideClip, 0.7f);
    public void PlayCoin() => PlayClip(coinClip, 0.9f);
    public void PlayGem() => PlayClip(gemClip, 1.0f);
    public void PlayHit() => PlayClip(hitClip, 1.0f);
    public void PlayMonsterRoar() => PlayClip(roarClip, 0.85f);
    public void PlayGameOver() => PlayClip(gameOverClip, 0.9f);

    private void PlayClip(AudioClip clip, float volume = 1f)
    {
        if (clip != null && sfxSource != null)
        {
            sfxSource.PlayOneShot(clip, volume);
        }
    }

    public void StartBGM()
    {
        if (bgmSource != null && !bgmSource.isPlaying)
        {
            bgmSource.loop = true;
            bgmSource.Play();
        }
    }

    public void PauseBGM() => bgmSource?.Pause();
    public void ResumeBGM() => bgmSource?.UnPause();
    public void StopBGM() => bgmSource?.Stop();
}`
  }
];
