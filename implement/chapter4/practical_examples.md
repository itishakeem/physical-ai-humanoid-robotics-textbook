# Chapter 4: Control Systems - Practical Examples

## Robotic Arm Pick-and-Place Task

A common manipulation task that demonstrates multiple control levels in action.

### System Overview

**Robot**: 7-DOF collaborative arm (UR10 by Universal Robots)
**Task**: Pick object from table, place in bin
**Key Challenge**: Accuracy (±2 cm positioning) and safety (force-limited interaction)

### Control Sequence

**Phase 1: Approaching Object (Duration: 2-3 seconds)**
- **High-Level Goal**: Move end-effector to above object
- **Intermediate Goal**: Use inverse kinematics to find joint configuration
  - Desired position: [x=1.2m, y=0.3m, z=0.5m]
  - IK solver finds 7 joint angles that achieve this
  - Time budget: 50 ms
  
- **Control Execution** (at 100 Hz):
  - PID controllers on each joint generate motor torques
  - Proportional gain: Kp = 50
  - Derivative gain: Kd = 5
  - Commands smooth acceleration to avoid jerky motion
  - Encoders feedback actual positions; errors diminish over time

- **Physical Result**: Arm smoothly extends toward object

**Phase 2: Grasping Object (Duration: 1 second)**
- **Force Control Challenge**: Grip tightly enough to lift object, but not crush it
  
- **Sensor Feedback**: Force/torque sensor at wrist measures grip forces
- **Control Strategy**: 
  - Close gripper while monitoring force
  - Target force: 100 N (sufficient to lift, not destructive)
  - When force reaches 100 N, stop closing gripper
  
- **Algorithm** (F/T Control Loop at 1000 Hz):
  ```
  F_error = F_target - F_measured
  gripper_command = Kp * F_error + Kd * dF/dt
  ```
  
- **Result**: Object held securely with predictable force

**Phase 3: Lifting and Moving (Duration: 3-5 seconds)**
- **Whole-Body Control**: Arm lifting while maintaining robot stability
  
- **Forces Involved**:
  - Weight of arm: 30 kg (gravity = 294 N downward)
  - Weight of object: 2 kg (gravity = 20 N downward)
  - Desired acceleration: 1 m/s² upward
  
- **Dynamics Calculation**:
  ```
  Required torque = M*α + C*ω + G
  M (inertia): ~150 kg·m² for arm configuration
  α (acceleration): 1 m/s²
  Result: 150 N·m + (minor friction) + (gravity) ≈ 320 N·m
  ```
  
- **Motor Command**: 95% of rated torque (staying within motor limits)
- **Feedback**: Accelerometers on arm confirm upward acceleration is achieved
  
- **Trajectory**: Path planning pre-computes smooth trajectory from pickup to drop location

**Phase 4: Placing Object (Duration: 2 seconds)**
- **Contact Detection**: As arm approaches bin, force sensors detect contact
- **Compliance Mode**: 
  - Once contact detected, switch to force control
  - Allow arm to yield slightly when it contacts bin edge
  - Prevents damage from collision (force-limited to 50 N)
  
- **Grasping Release**: Gradually open gripper while monitoring if object slides
  - Reduce grip force: 100N → 50N → 0N
  - Use slip sensors to detect when object is stable
  - Open gripper completely
  
- **Retraction**: Move arm away from bin

**Cycle Time**: ~10 seconds per pick-and-place operation

### Error Recovery

**If object not fully grasped**:
- Force sensor doesn't reach 100 N after timeout
- Gripper reopens, retries from Phase 1
- System detects failure and re-attempts

**If arm hits obstacle**:
- Force/torque sensor detects unexpected force
- Motion stops immediately (safety)
- System retracts and replans path

---

## Dynamic Balancing Algorithm: Boston Dynamics Atlas

Dynamic balancing is essential for bipedal locomotion. Atlas demonstrates sophisticated real-time balance control.

### Balance Control Architecture

**Measurement** (at 1000 Hz):
- IMU readings: body acceleration and rotation rate
- Ankle force sensors: ground reaction forces at each foot
- Joint encoders: entire body pose

**Compute** (at 200 Hz):
1. Estimate Center of Mass (CoM) position and velocity
2. Predict CoM trajectory for next 1-2 seconds
3. Compute required ground reaction forces to keep CoM over support
4. Solve whole-body control QP to generate joint commands

**Actuate** (at 1000 Hz):
- PID controllers apply computed joint torques

### Example: Responding to Push

**Scenario**: Robot walking; external force pushes robot sideways (100 N force)

**Timeline**:

**t=0 ms**: Push force applied to robot's torso
- Accelerometers measure: 1.5 m/s² lateral acceleration
- Gyroscopes measure: 0.5 rad/s² angular velocity

**t=2 ms**: Push detected by low-level accelerometer filters
- System determines robot is off-balance

**t=5 ms**: Balance controller recomputes:
- Current CoM velocity: 0.3 m/s sideways (due to 1.5 m/s² × 2 ms)
- Required ankle torque to stop CoM motion: 500 N·m

**t=8 ms**: Motor torques updated
- Hip and ankle motors increase output torque
- Body tilts slightly to counteract push (controlled tilt, not falling)

**t=15 ms**: Force sensors confirm CoM is stabilizing
- CoM acceleration decreasing: 1.5 m/s² → 0.8 m/s²

**t=50 ms**: Balance restored
- CoM motion stopped
- Body returns upright
- Walking resumes

**Total time to recover**: 50 milliseconds (imperceptible to human observer)

### Stability Margin

Atlas maintains **Zero Moment Point (ZMP)** within support polygon with margin:

- Support polygon: area under feet (~0.3 m² during walking)
- Desired ZMP position: center of support polygon (safest)
- Actual ZMP: continuously adjusted but always >5 cm from edge
- Result: Robot can tolerate 3-5 second delays in balance response before falling

---

## Walking Gait Generation: Trajectory Optimization

Creating a walking gait involves generating foot placements and body motions that are:
1. Stable (ZMP always in support)
2. Energy efficient
3. Comfortable (smooth acceleration)

### Gait Generation Process

**Input Parameters**:
- Desired walking speed: 1.0 m/s
- Step length: 0.5 m
- Step frequency: 2 steps/second
- Terrain: flat ground

**Phase 1: Footstep Planning** (10 Hz, offline)
- Compute sequence of foot placements 1 second ahead
- Positions: [1.0m, 0.2m], [1.5m, -0.2m], [2.0m, 0.2m], ...
- Ensure stability at each step transition

**Phase 2: Center of Mass Trajectory** (100 Hz, online)
- Given foot placements, compute smooth CoM trajectory
- Constraint: CoM must be achievable by moving legs to foot positions
- Optimization: Minimize energy (torque²·time summed over all joints)
- Result: CoM follows smooth path, roughly 0.3m above ground

**Phase 3: Inverse Kinematics** (100 Hz)
- Given desired foot positions and CoM trajectory:
- Compute required hip/knee/ankle angles
- Solve 6-DOF leg IK for each leg independently
- Time: ~10 ms per leg

**Phase 4: Joint-Level Control** (1000 Hz)
- PID controllers track computed joint trajectories
- Error feedbacks adjust commands in real-time

### Gait Efficiency Metrics

For 10-meter walk (20 steps):

| Metric | Value |
|--------|-------|
| Duration | 10 seconds |
| Average speed | 1 m/s |
| Step length | 0.5 m |
| Cadence | 2 steps/s |
| Energy per step | ~15 J (electrical input) |
| Efficiency | ~25% (mechanical work / electrical input) |
| Peak motor power | 1500 W (during swing phase) |
| Average power | 300 W |

---

## Force Control: Surgical Robot Precision

da Vinci surgical robot demonstrates precision force control needed for delicate manipulation.

### Surgical Tool Tip Control

**Objective**: Move surgical tool with <1 mm accuracy and <0.5 N force

**System Components**:
- Surgeon console (remote, 3000 km away possible)
- Master controls (surgeon manipulates these)
- Slave robot at patient bedside
- Force/torque sensor at tool tip

### Control Loop (at 1000 Hz)

**Measurement**:
- Joint encoders on slave arm (7 DoF): current position
- Force/torque sensor at tool tip: forces detected (±50 N range, ±0.05 N resolution)
- Master console position: what surgeon commanded

**Compute**:
1. Desired tool position from master control
2. Inverse kinematics: find joint angles for desired position
3. Compute required forces to hold tool steady
4. Read actual forces from sensor
5. Adjust position slightly to minimize force error

**Actuate**:
- Joint motors position tool precisely

### Force Feedback Path (Haptic Feedback)

Reality unusual: surgeon feels forces through master controls:
- Tool encounters tissue resistance (force sensor measures 2 N)
- This force is transmitted back to master control
- Surgeon feels 2 N resistance on console handle
- Surgeon adapts pressure intuitively

**Safety**: If forces exceed threshold (>5 N), system automatically reduces pressure to prevent tissue damage.

### Example: Suturing

**Sequence** (duration: ~10 seconds per stitch):

1. **Needle positioning**: Move needle to tissue entry point
   - Accuracy needed: 0.5 mm
   - Force control: maintain <0.2 N to avoid puncturing prematurely

2. **Puncture**: Push needle through tissue
   - Force feedback: resistance increases gradually as needle enters
   - Surgeon feels increasing pressure through haptic feedback
   - Surgeon stops pushing when resistance reaches ~3 N
   - Result: needle passes through tissue cleanly

3. **Knot tying**: Complex 3D manipulation
   - Multiple arm movements coordinated to form knot
   - Force feedback prevents over-tightening (max tension 1 N)
   - Result: secure knot with minimal trauma

4. **Thread cutting**: Tool performs final trim
   - Force controlled to <0.1 N to avoid cutting tissue
   - Result: clean, bloodless surgery site

**Outcome**: Minimally invasive surgery with reduced patient recovery time, enabled by precise control systems.

