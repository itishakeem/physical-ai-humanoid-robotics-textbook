# Chapter 4: Control Systems - Diagrams / Illustrations

## Control System Architecture Flowchart

This diagram shows the hierarchical control architecture of a typical humanoid robot.

```
┌───────────────────────────────────────────────────────────────┐
│                    TASK PLANNING LAYER (10 Hz)                │
│              High-Level Behavior / Strategic Decision          │
│                   • "Walk to target location"                  │
│                   • "Pick up object"                           │
│                   • "Navigate around obstacle"                 │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│              TRAJECTORY PLANNING LAYER (100 Hz)               │
│     Medium-Level Task Decomposition & Path Planning           │
│                                                               │
│  Input: High-level task (e.g., "pick up object")            │
│  Process:                                                     │
│    1. Identify object location using vision                  │
│    2. Plan arm trajectory (inverse kinematics)               │
│    3. Plan footstep sequence (gait generation)               │
│    4. Coordinate multi-body motion                           │
│  Output: Desired joint positions + velocities over time      │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│         WHOLE-BODY CONTROL LAYER (200 Hz, ~5 ms)             │
│        Unified Optimization of All Degrees of Freedom        │
│                                                               │
│  Solve Quadratic Program (QP):                                │
│  • Objective: Track desired trajectory                        │
│  • Constraints: Physics, friction, joint limits              │
│  • Output: Desired joint accelerations/torques               │
│                                                               │
│  Handles conflicts intelligently:                             │
│  • Must maintain balance (highest priority)                   │
│  • Then track arm motion (secondary)                          │
│  • Then achieve efficiency (tertiary)                         │
└───────────────────────────────────────────────────────────────┘
                              ↓
┌───────────────────────────────────────────────────────────────┐
│        JOINT-LEVEL SERVO CONTROL (1000 Hz, 1 ms)             │
│  Low-Level Motor Control via Feedback Loops (PID/State FB)   │
│                                                               │
│  For each of N joints:                                        │
│    1. Read joint encoder (current position)                   │
│    2. Compute error vs. target position                       │
│    3. Apply PID: u = Kp*e + Ki*∫e + Kd*de/dt              │
│    4. Send command to motor driver                            │
│    5. Motor rotates, changing joint angle                     │
│                                                               │
│  Result: Smooth, damped approach to target angle              │
│  Handles disturbances in real-time                            │
└───────────────────────────────────────────────────────────────┘
                              ↓
                      ┌──────────────┐
                      │   ACTUATORS  │
                      │              │
                      │  • Motors    │
                      │  • Hydraulics│
                      │  • Solenoids │
                      └──────────────┘
                              ↓
                      ┌──────────────┐
                      │    ROBOT     │
                      │   MECHANICS  │
                      │              │
                      │  Joints move │
                      │  Body motion │
                      └──────────────┘
                              ↓
                      ┌──────────────┐
                      │   SENSORS    │
                      │              │
                      │  • Encoders  │
                      │  • IMU       │
                      │  • F/T Sensor│
                      │  • Cameras   │
                      │  • LiDAR     │
                      └──────────────┘
                              ↓
                        [FEEDBACK LOOPS]
                        ↑             ↑
                        └─────────────┘

Legend:
═══════
─→ Information flow (feedforward)
↑ Measurement feedback
Each layer processes information at different frequency (faster at lower layers)
Typical latency per layer: ~5-10 ms
Total system latency: ~30-50 ms (acceptable for bipedal balance)
```

---

## PID Controller Visualization

This diagram illustrates the three components of a PID controller and their effects.

```
              JOINT ANGLE CONTROL EXAMPLE
    Target: 30°    Actual: 25°    Error: 5°

Time Evolution of Control Response:

        Angle (°)
           40 ┤
              │                ╭─ No overshoot (ideal)
              │
           30 ┤        ┌──────╭─  Target
              │       ╱╱
              │      ╱╱ ← Proportional term dominates
              │     ╱  
           20 ┤    ╱
              │   ╱
              │  ╱
           10 ┤ ╱
              │╱
            0 ├┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴┴
              0   0.2  0.4  0.6  0.8  Time (s)


Component Contributions Over Time:

Time: 0.0 s
  Error: 5°
  ├─ Proportional (Kp=50):  5 * 50 = 250  ← Large immediate response
  ├─ Integral (Ki=5):       0.0         ← No integral yet
  ├─ Derivative (Kd=10):    0.0         ← No rate change yet
  └─ Total Command: 250

Time: 0.1 s
  Error: 3°
  ├─ Proportional (Kp=50):  3 * 50 = 150  ← Reduced as error shrinks
  ├─ Integral (Ki=5):       0.3 * 5 = 1.5 ← Accumulating
  ├─ Derivative (Kd=10):    -20 * 10 = -200 ← Damping: error changing at -20°/s
  └─ Total Command: 150 + 1.5 - 200 = -48.5 (slight deceleration)

Time: 0.2 s
  Error: 1°
  ├─ Proportional (Kp=50):  1 * 50 = 50    ← Small correction
  ├─ Integral (Ki=5):       0.8 * 5 = 4.0  ← More accumulated
  ├─ Derivative (Kd=10):    -5 * 10 = -50  ← Preventing overshoot
  └─ Total Command: 50 + 4 - 50 = 4 (fine-tuning)

Time: 0.4 s
  Error: 0° (reached target)
  ├─ Proportional (Kp=50):  0 * 50 = 0
  ├─ Integral (Ki=5):       2.0 * 5 = 10    ← Integral tail (very small)
  ├─ Derivative (Kd=10):    0 * 10 = 0
  └─ Total Command: 10 (slight offset to maintain position)


EFFECT OF TUNING PARAMETERS:

High Kp (e.g., 100):          Medium Kp (e.g., 50):         Low Kp (e.g., 20):
  │                             │                             │
  │    ╭───                      │  ╱─                         │     ╱───
  │   ╱                          │ ╱                           │    ╱
  │ ╱  Overshoot!               │╱  Smooth                     │___╱ Slow!
  │╱   Oscillations             Target reached smoothly        Takes 2 seconds
  └                              └                             └


High Kd (damping):            Medium Kd:                    Low Kd:
  │   Smooth, slow              │  Balanced                    │  Oscillatory
  │────                         │ ╱───                         │  ╭──╮ ╭──╮
  │   Overdamped                │╱     No overshoot            │ ╱    ╲╱    ╲
  └                             └                             └


PID Gain Selection (Typical Values for Joint Control):
┌────────────────────────────────────────────┐
│ Joint Type        │ Kp    │ Ki   │ Kd     │
├────────────────────────────────────────────┤
│ Heavy (hip/knee)  │ 50-100│ 2-5  │ 5-15   │
│ Light (wrist)     │ 20-50 │ 1-2  │ 2-5    │
│ Tool tip          │ 10-30 │ 0.5-1│ 1-3    │
└────────────────────────────────────────────┘
```

---

## Inverse Kinematics: 2-Link Arm Example

This diagram shows how inverse kinematics solves for joint angles from desired position.

```
                    FORWARD KINEMATICS
                    (Position given angles)

                         Joint 2 (θ₂)
                         ╱╱╱╱╱╱
                        ╱ L₂ ╱
                       ╱    ╱
                      ╱────╱ → End-Effector (x, y)
                     ╱
                    ╱ Joint 1 (θ₁)
                   ╱
                  ├─── L₁ ────
                  │
                  O (Base)

Formula:
x = L₁·cos(θ₁) + L₂·cos(θ₁ + θ₂)
y = L₁·sin(θ₁) + L₂·sin(θ₁ + θ₂)

Given: θ₁ = 30°, θ₂ = 45°, L₁ = 1 m, L₂ = 0.8 m
Compute:
x = 1·cos(30°) + 0.8·cos(75°)  = 0.866 + 0.207 = 1.073 m
y = 1·sin(30°) + 0.8·sin(75°)  = 0.5 + 0.773 = 1.273 m


                 INVERSE KINEMATICS
              (Angles from desired position)

Problem: Given desired (x, y), find (θ₁, θ₂)

ANALYTICAL SOLUTION (closed-form):
For 2-link arm:

Law of cosines: d² = L₁² + L₂² - 2·L₁·L₂·cos(π - θ₂)
              where d = √(x² + y²)

θ₂ = acos((x² + y² - L₁² - L₂²) / (2·L₁·L₂))
θ₁ = atan2(y, x) - atan2(L₂·sin(θ₂), L₁ + L₂·cos(θ₂))

Given: desired (x, y) = (1.5, 1.0) m, L₁ = 1 m, L₂ = 0.8 m

Step 1: Calculate distance
d = √(1.5² + 1.0²) = √(2.25 + 1.0) = 1.806 m

Step 2: Calculate θ₂
θ₂ = acos((2.25 + 1.0 - 1.0 - 0.64) / (2·1·0.8))
   = acos(1.61 / 1.6)
   = acos(1.006) → IMPOSSIBLE!

Interpretation: End-effector is out of reach (too far)
Maximum reach: L₁ + L₂ = 1.8 m
Desired distance: 1.806 m < 1.8 m → Just barely reachable

Modified desired position: (1.4, 0.8) m

Step 1 (revised): Calculate distance
d = √(1.4² + 0.8²) = √(2.96) = 1.72 m

Step 2: Calculate θ₂
θ₂ = acos((1.96 + 0.64 - 1.0 - 0.64) / 1.6)
   = acos(0.96) = 16.26°

Step 3: Calculate θ₁
θ₁ = atan2(0.8, 1.4) - atan2(0.8·sin(16.26°), 1.0 + 0.8·cos(16.26°))
   = 29.74° - atan2(0.225, 1.765)
   = 29.74° - 7.25° = 22.49°

SOLUTION: θ₁ = 22.49°, θ₂ = 16.26°


MULTIPLE SOLUTIONS (Redundancy):

2-link arm has exactly 2 solutions for most positions (elbow-up and elbow-down):

Target (x, y)
     ↓
    ╱ ← Elbow-Up Solution: θ₁ = 22.49°, θ₂ = 16.26°
   ╱
  ├─────
  
  
  
  └─
   ╲ ← Elbow-Down Solution: θ₁ = -17.51°, θ₂ = -156.26°


7-DOF HUMANOID ARM: Infinite Solutions!

7 degrees of freedom, 3 spatial coordinates to reach (x, y, z)
7 - 3 = 4 dimensional null-space of solutions

Control system selects best solution by:
1. Minimizing energy (prefer configurations requiring less torque)
2. Avoiding obstacles (prefer paths clear of collision)
3. Maintaining balance (prefer movements that don't destabilize robot)
4. Maximizing manipulability (prefer configurations with good dexterity)

Most common approach: Jacobian-based optimization
θ_solution = argmin || J(θ)·dθ - dx || + λ·||dθ||²
where λ is regularization weight favoring smaller joint movements


CONVERGENCE OF ITERATIVE IK SOLVER:

Iteration 0:
Current pose: θ = [0°, 0°, 0°, 0°, 0°, 0°, 0°]
End-effector position: (0.5, 0, 2.0) m
Target position: (1.4, 0.8, 1.5) m
Error: 1.3 m

Iteration 1:
Compute Jacobian J (7×3 matrix)
Calculate: dθ = α·J⁺·(target - current)  [where J⁺ is pseudoinverse]
New angles: θ ← θ + dθ
End-effector position: (0.8, 0.3, 1.7) m
Error: 0.8 m

Iteration 2:
End-effector position: (1.1, 0.55, 1.6) m
Error: 0.4 m

Iteration 3:
End-effector position: (1.3, 0.75, 1.5) m
Error: 0.15 m

Iteration 4:
End-effector position: (1.39, 0.79, 1.5) m
Error: 0.02 m (converged!)

Convergence time: ~50 ms for 7-DOF arm
```

---

## Whole-Body Control Optimization

This diagram shows how whole-body control balances competing objectives.

```
WHOLE-BODY CONTROL PROBLEM FORMULATION:

At each time-step, solve:

Minimize: ||a - a_desired||²_Q + ||τ||²_R

Subject to:
  M(q)·a + C(q,v)·v + G(q) = τ                    [Dynamics constraint]
  f_L + f_R = m·g + m·a_CoM                       [CoM acceleration]
  |f| < μ·|f_N|  (friction cone)                  [No slipping]
  -τ_max ≤ τ ≤ τ_max                             [Torque limits]
  -θ_max ≤ θ ≤ θ_max                             [Joint limits]
  ZMP ∈ Support Polygon ± margin                  [Balance]
  x_hand = target + tracking_error                [Reaching objective]

Variables to solve for:
  q  = joint positions (7 per leg + 3 per arm + 3 torso = 40 DoF)
  v  = joint velocities
  a  = joint accelerations        ← Primary output
  τ  = joint torques
  f_L, f_R = ground reaction forces (left and right foot)


EXAMPLE: WALKING WHILE REACHING

Robot state:
  • Standing on both feet
  • Task 1: Walk forward at 1 m/s (locomotion objective)
  • Task 2: Move left arm to reach shelf at (1.5m, 0.5m, 1.5m)
  • Constraint: Don't fall (maintain balance)

Conflicting objectives:
  • Walking requires center-of-mass acceleration
  • Reaching requires arm acceleration
  • Both can't happen simultaneously without destabilizing

Solution found by QP optimization:

┌─────────────────────────────────────┐
│ PRIORITY 1: Balance (hard constraint)│
│ ZMP must stay in support polygon    │
│                                     │
│ Margin: 5 cm from edge              │
│ Non-negotiable: safety              │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│ PRIORITY 2: Locomotion              │
│ Achieve forward walking at 1 m/s    │
│                                     │
│ Allocate 70% of leg torque budget   │
└─────────────────────────────────────┘
                 ↓
┌─────────────────────────────────────┐
│ PRIORITY 3: Reaching                │
│ Move arm toward target shelf        │
│                                     │
│ Remaining arm/torso torque budget   │
│ Reach velocity reduced to 0.5 m/s   │
│ (instead of requested 1.0 m/s)      │
└─────────────────────────────────────┘

Result: Robot walks forward while slowly reaching for shelf
        If balance threatened, reaching stops (arm holds position)


COMPUTATIONAL COMPLEXITY:

Problem size:
  • 40 decision variables (joint accelerations)
  • 50+ constraints
  • Real-time deadline: 5 ms

Solution method: Quadratic Programming (QP)
  • Algorithms: Interior Point, Active Set
  • Libraries: qpOASES, SCS
  • Typical solve time: 2-4 ms (room for margin)
  • Total loop time: 5 ms
    - Read sensors: 1 ms
    - Solve QP: 3 ms
    - Send commands: 1 ms

Fallback: If solve takes >5 ms
  • Use warm-start with previous solution
  • Reduces solve time to &lt;2 ms
  • Slightly suboptimal but still stable
```

---

## Kalman Filter for State Estimation

This diagram shows how Kalman filtering optimally combines sensor data.

```
KALMAN FILTER: RECURSIVE OPTIMAL STATE ESTIMATION

Problem: Estimate robot's full state from noisy sensors

Example: Estimate bipedal robot's Center of Mass (CoM) position

Sensors available:
  • IMU: Accelerometers measure acceleration (noisy: σ_a = 0.5 m/s²)
  • Force sensors: Two force plates measure weight distribution
  • Encoders: Joint angles (highly accurate: σ_θ = 0.1°)

STATE VECTOR: x = [CoM_position, CoM_velocity]

PREDICTION PHASE (using motion model):

Time t-1:
  x̂(t-1) = [1.2 m, 0.8 m/s]  (estimated CoM position and velocity)

From t-1 to t (Δt = 10 ms):
  Using kinematics: x(t) = x(t-1) + v(t-1)·Δt
  Prediction: x̂_pred(t) = [1.2 + 0.8·0.01, 0.8] = [1.208 m, 0.8 m/s]
  Prediction covariance: P_pred(t) = P(t-1) + Q
    where Q is process noise (model has uncertainty)

MEASUREMENT PHASE:

Sensors now report:
  • Accelerometer: a_meas = 0.5 m/s² (goal was 0, so CoM is accelerating)
  • Force sensors: CoM moving forward (not useful for position directly)
  • Encoders: Joint angles indicate calculated CoM should be at 1.21 m

FUSION:

Innovation (predicted - measured):
  Δx = x̂_pred - x_meas = [1.208 - 1.21, 0.8 - 0.50] = [-0.002, 0.30]

Kalman Gain (how much to trust measurements vs. prediction):
  K = P_pred · (P_pred + R)⁻¹
  where R is measurement noise covariance

If R (measurement noise) is large:
  K is small → trust prediction more than measurement

If R is small (high-confidence sensors):
  K is large → trust measurement more than prediction

Fused estimate:
  x̂(t) = x̂_pred + K·Δx
  x̂(t) = [1.208, 0.8] + K·[-0.002, 0.30]

Typical K values:
  K = [0.7, 0.5]

Result:
  x̂(t) = [1.208 + 0.7·(-0.002), 0.8 + 0.5·0.30]
       = [1.206 m, 0.95 m/s]

Updated covariance:
  P(t) = (I - K·H)·P_pred
  Result: Uncertainty reduced (we now have more information)


COMPARISON: KALMAN FILTER vs. SIMPLE AVERAGE

Single measurement (no Kalman):
  CoM position = (1.208 + 1.21)/2 = 1.209 m
  No velocity estimate
  Still uncertain about acceleration

With Kalman filter:
  CoM position = 1.206 m (accounts for prediction model)
  CoM velocity = 0.95 m/s (estimated from acceleration)
  Uncertainty quantified (know we're 68% confident within ±0.05 m)
  Smooth trajectory (filter removes measurement noise)


PRACTICAL BENEFIT: BALANCE CONTROL

Humanoid robot balance relies on accurate CoM estimation:

Without Kalman filter:
  • Sensor noise directly affects control commands
  • Robot over-corrects, creating oscillations
  • Unnatural, jerky movements

With Kalman filter:
  • Noise filtered out
  • Control responds smoothly to real motion
  • Natural-appearing, stable walking

Result: Difference between jerky robot and smooth biped.
```

