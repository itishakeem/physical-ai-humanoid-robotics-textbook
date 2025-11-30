# Chapter 4: Control Systems - Key Concepts

## Forward and Inverse Kinematics

Kinematics describes how joint angles relate to end-effector (hand/gripper) position without considering forces.

### Forward Kinematics (FK)

Forward kinematics answers: *"Given joint angles, where is the end-effector?"*

**Process**:
1. Start at base with known position (0, 0, 0)
2. Apply rotation/translation for each joint sequentially
3. Compute final position of end-effector

**Mathematical Representation** (Denavit-Hartenberg Parameters):
- Link 1: length L₁, joint angle θ₁
- Link 2: length L₂, joint angle θ₂
- End-effector position: x = L₁·cos(θ₁) + L₂·cos(θ₁+θ₂)
                         y = L₁·sin(θ₁) + L₂·sin(θ₁+θ₂)

**Complexity**: Straightforward calculation; linear in number of joints.

**Application**: Real-time position feedback; know where hand is during movement.

### Inverse Kinematics (IK)

Inverse kinematics answers: *"What joint angles achieve this hand position?"*

**Problem**: Given desired (x, y), find (θ₁, θ₂, ..., θₙ)

**Challenge**: Multiple solutions often exist (robot arm can reach same point different ways). For humanoids with >7 DoF, infinite solutions exist.

**Methods**:

1. **Analytical Solution**: Solve algebraic equations
   - Fast but only works for relatively simple arm structures
   - Example: 2-link arm has closed-form solution

2. **Numerical Solution**: Iteratively adjust joint angles to minimize error
   - **Jacobian Method**: Uses partial derivatives to guide adjustment direction
   - Formula: Δθ = J⁻¹ · Δx (where J is the Jacobian matrix)
   - Computation time: 10-50 ms per solve
   - Works for high-DoF systems

3. **Learning-Based**: Train neural network to predict joint angles
   - Very fast inference once trained
   - Can find optimal solution (e.g., most efficient path)
   - Requires training data

**Real-World Example**: 7-DOF humanoid arm reaching toward object at (1.5m, 0.5m, 1.2m)
- Multiple joint configurations can achieve this position
- Control system selects configuration that:
  - Avoids singularities (where Jacobian is non-invertible)
  - Minimizes energy consumption
  - Avoids obstacles
  - Maintains stability of body

---

## Dynamics: Forces, Masses, and Accelerations

While kinematics ignores forces, dynamics describes how forces affect motion.

### Newton's Laws Applied to Robots

**Equation of Motion** (Lagrangian Mechanics):
```
τ = M(θ)·α + C(θ,ω)·ω + G(θ)
```

Where:
- **τ** = applied torques (motor commands)
- **M(θ)** = mass matrix (depends on configuration)
- **α** = joint accelerations (what we want to command)
- **C(θ,ω)·ω** = Coriolis and centrifugal forces
- **G(θ)** = gravity effects

**Intuition**:
- M·α is inertia (heavier limbs = more torque needed to accelerate)
- C·ω is centrifugal force (spinning faster = harder to control)
- G is gravity (holding arm overhead = constant torque load)

### Mass Matrix Example: Single Pendulum (Humanoid Leg Swing)

For a single joint with mass m at distance L:
- M = m·L² (moment of inertia)
- C·ω = 0 (single joint, no Coriolis)
- G = m·g·L·cos(θ) (gravity component)

Command torque: τ = m·L²·α + m·g·L·cos(θ)

**Implication**: As leg swings down (θ increases), gravity helps more, reducing required motor torque. Control must account for this.

### Linearization

Nonlinear dynamics are computationally expensive. Control often uses **linearization**:

Around nominal trajectory, approximate:
```
Δτ = M·Δα + C·Δω + K_p·Δθ + K_d·Δω
```

This becomes linear and solvable in real-time (&lt;1 ms per solve).

**Limitation**: Only valid near nominal trajectory; large deviations require relinearization.

---

## Feedback Control: PID and Beyond

Feedback control adjusts actuator commands based on sensor feedback to minimize error.

### Proportional-Integral-Derivative (PID) Control

The most widely used feedback controller:

```
u(t) = Kp·e(t) + Ki·∫e(t)dt + Kd·de/dt
```

Where:
- **e(t)** = error (target - actual)
- **Kp** = proportional gain
- **Ki** = integral gain
- **Kd** = derivative gain
- **u(t)** = control output (motor command)

**Components**:

1. **Proportional (Kp·e)**:
   - Error = 10°? Output = 10·Kp (proportional response)
   - Provides direct corrective action
   - Too high → oscillation; too low → slow response

2. **Integral (Ki·∫e)**:
   - Accumulates error over time
   - Eliminates steady-state error
   - Responds to persistent errors (e.g., friction loading)

3. **Derivative (Kd·de/dt)**:
   - Responds to rate of error change
   - Provides damping to prevent overshoot
   - Stabilizes system, prevents oscillation

**PID Tuning** (trial-and-error process):
- Start with Kp and Kd, adjust for stable response
- Add Ki to eliminate steady-state error
- Too much Ki → sluggish response
- Too much Kd → noise amplification

**Real Example**: Joint encoder reads 25°, target is 30° (error = 5°)
- Proportional output: 5·Kp (if Kp=5 → output=25)
- Derivative output: -10·Kd (error decreasing at 10°/s → negative correction)
- Integral output: accumulated over 100 ms = 10·Ki
- Total: u = 25 - 10·Kd + 10·Ki (usually Ki is small)

### State Feedback Control

More sophisticated than PID, uses full state (not just position error):

```
u(t) = -K·x(t)
```

Where:
- **x(t)** = state vector [position, velocity, acceleration, ...]
- **K** = feedback gain matrix
- **u(t)** = control output

**Advantages**:
- Theoretically optimal for linear systems (Linear Quadratic Regulator - LQR)
- Handles multiple inputs and outputs naturally
- Can be tuned for specific performance objectives

**Computational Cost**: Slightly higher than PID but still real-time feasible (~5 ms)

---

## Whole-Body Control (WBC)

Humanoids have 30-60 degrees of freedom; controlling each joint independently is insufficient. Whole-body control coordinates all joints toward high-level objectives.

### Hierarchical Control Architecture

```
Level 3: High-Level Behavior
         "Walk forward 5 meters" (10 Hz)
              ↓
Level 2: Task Specification
         "Place left foot at (1.0m, 0.2m)" (100 Hz)
              ↓
Level 1: Joint Coordination
         Solve inverse kinematics → joint angles (100 Hz)
              ↓
Level 0: Joint-Level Control
         Apply PID control to each joint (1000 Hz)
```

### Formulation: Quadratic Programming

WBC solves an optimization problem at each control cycle:

```
Minimize:   ||a - a_desired||²    (achieve desired accelerations)
Subject to: 
  - Dynamics constraints (physics must be obeyed)
  - Friction cone constraints (foot cannot slip)
  - Joint limits (joints cannot exceed max angle)
  - Torque limits (motors have max output)
  - Balance constraint (ZMP must stay within support)
```

**Solver**: Quadratic Programming (QP) solver computes joint torques in 5-20 ms.

**Example Scenario**: Atlas walking while reaching
- Left leg: Must maintain balance and generate forward motion
- Right leg: Placement for next step
- Left arm: Reaching toward object
- Right arm: Balancing body pose

WBC automatically distributes torques across all joints to:
1. Maintain balance (top priority)
2. Complete reaching motion (secondary)
3. Prepare next step (tertiary)

If reaching would cause imbalance, WBC automatically reduces reach amplitude.

---

## Stability Analysis: Lyapunov Functions

How do we verify a control system is stable?

### Lyapunov Stability

A system is stable if the **Lyapunov function** (usually energy) decreases over time:

```
V(x) = 0 at equilibrium
V(x) > 0 elsewhere
dV/dt < 0 (always decreasing)
```

**Intuition**: If system energy continuously decreases, it must eventually settle to equilibrium.

**Example: Pendulum**
- Equilibrium: hanging down (θ = 0)
- Energy: V = (1/2)·m·L²·ω² + m·g·L·(1 - cos(θ))
- With friction, energy always decreases → pendulum will come to rest

**Application to Humanoids**:
- Verify walking gaits won't diverge
- Prove balance controller will stabilize robot
- Design controllers with guaranteed stability

### Region of Attraction

Real systems have constraints (joint limits, friction, etc.). The **region of attraction** is the range of states from which the system can stabilize:

- Large region → robust controller (works from many initial states)
- Small region → fragile controller (must start near nominal condition)

Humanoid walking is particularly sensitive; if robot tips too far off-balance, even optimal control cannot prevent a fall.

---

## Real-Time Constraints and Computational Complexity

Robot control must meet strict real-time deadlines:

| Control Level | Frequency | Time Budget | Algorithm |
|---|---|---|---|
| Joint Motor | 1000 Hz | 1 ms | PID (simple, fast) |
| Joint Coordination | 100 Hz | 10 ms | Inverse kinematics + dynamics |
| Task Planning | 100 Hz | 10 ms | Force control, gait phase updates |
| Behavior Planning | 10 Hz | 100 ms | Path planning, decision making |

**Miss Deadline = System Failure**:
- Miss 1 ms deadline at 1000 Hz: Joint spirals into oscillation
- Miss 10 ms deadline at 100 Hz: Unstable motion, possible fall
- Miss 100 ms deadline at 10 Hz: Delayed response to environment changes

**Mitigation Strategies**:
- Dedicated real-time OS (e.g., Linux with PREEMPT_RT) guarantees deterministic scheduling
- Separate threads for each control level with priority inheritance
- Fallback behaviors (if task planning misses deadline, use previous plan)

---

## Model Predictive Control (MPC)

Advanced technique that optimizes control over future time horizon:

```
At each timestep t:
  1. Predict robot state for next 10 steps (100 ms horizon)
  2. Simulate candidate control sequences
  3. Optimize sequence to minimize cost function
  4. Execute first step of optimal sequence
  5. Repeat (receding horizon)
```

**Advantages**:
- Naturally handles constraints (foot placement limits, etc.)
- Multi-objective optimization (balance + reaching + efficiency)
- Anticipatory (robot plans ahead rather than reacting)

**Disadvantage**: Computationally expensive (requires simulating 10-20 scenarios per cycle)

**Application**: Boston Dynamics Atlas uses MPC-like planning for complex locomotion.

