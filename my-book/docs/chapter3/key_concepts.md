# Chapter 3: Sensors and Actuators - Key Concepts

## Classification of Sensors

### Proprioceptive Sensors
Proprioceptive sensors measure the robot's internal state and kinematics:

- **Joint Encoders**: Measure joint angles using rotational encoders. Incremental encoders count pulses, while absolute encoders provide precise position immediately upon startup.
- **Inertial Measurement Units (IMU)**: Contain accelerometers and gyroscopes that measure linear acceleration and angular velocity. Essential for balance and dynamic movement estimation.
- **Force/Torque Sensors**: Measure forces and moments at wrist or joint interfaces. Critical for manipulation tasks and impedance control.
- **Current Sensors**: Monitor motor currents to estimate load and joint torque, providing indirect force feedback.

### Exteroceptive Sensors
Exteroceptive sensors perceive the external environment:

- **Vision Systems**:
  - **RGB Cameras**: Provide color images for object recognition, face detection, and navigation
  - **Depth Cameras** (e.g., RealSense, Kinect): Capture 3D point clouds for environment mapping and obstacle detection
  - **Stereo Cameras**: Reconstruct depth through binocular vision, mimicking human vision
  
- **LiDAR (Light Detection and Ranging)**: Uses laser pulses to measure distances to objects. Creates high-resolution 3D maps of the environment. Excellent for outdoor navigation and obstacle avoidance.

- **Tactile Sensors**: Detect contact and measure contact force:
  - **Pressure Sensors**: Grid-based arrays that detect contact location and pressure magnitude
  - **Slip Sensors**: Detect micro-motion between gripper and object, essential for preventing drops
  - **Temperature Sensors**: Measure surface temperature, useful for safety and thermal perception

- **Audio Sensors (Microphones)**: Enable speech recognition and sound-based event detection.

## Sensor Fusion

Sensor fusion integrates data from multiple sensors to produce more accurate and reliable estimates than any single sensor:

- **Complementary Fusion**: Combines sensors with different frequency responses (e.g., gyroscope + accelerometer for orientation)
- **Kalman Filtering**: Probabilistic approach that optimally fuses sensor data by accounting for noise and uncertainty
- **Multi-Sensor Calibration**: Ensures that multiple sensors provide consistent measurements by spatial alignment and temporal synchronization

Example: Fusing IMU data with LiDAR for robust localization in GPS-denied environments.

---

## Actuator Types and Characteristics

### Electric Motors

**Brushless DC (BLDC) Motors** are the most common actuators in humanoid robots:
- **Advantages**: Precise control, high efficiency, moderate torque, clean operation
- **Disadvantages**: Require electronic commutation, generate heat at high speeds
- **Applications**: Joint rotation, locomotion

**Series Elastic Actuators (SEA)**: Include a spring between motor and load:
- **Advantages**: Measure output force directly, provide force control capability
- **Disadvantages**: Increased complexity, reduced response speed
- **Applications**: Safe human-robot interaction, force-controlled manipulation

### Hydraulic Actuators

Hydraulic systems use pressurized fluid to produce motion:
- **Advantages**: Very high power density (high force in small volume), smooth motion, high force output
- **Disadvantages**: Complex fluid systems, potential leaks, non-zero friction, requires pump and accumulator
- **Applications**: Dynamic robots like Boston Dynamics Atlas; powerful limb movements

Hydraulic cylinders produce linear motion; hydraulic motors produce rotational motion.

### Pneumatic Actuators

Pneumatic systems use compressed air:
- **Advantages**: Lightweight, inherently safe, compliant, fast response
- **Disadvantages**: Lower force output, less precise control, requires air compressor
- **Applications**: Lightweight humanoids, compliant grippers

### Soft Actuators

Emerging technology using flexible materials:
- **Advantages**: Inherently safe, highly compliant, lightweight, human-like motion
- **Disadvantages**: Less precise, slower response, challenging control
- **Applications**: Social robots, safe collaboration

---

## Motor-Transmission Systems

Direct drive vs. geared drive represent key design tradeoffs:

| Feature | Direct Drive | Geared Drive |
|---------|--------------|--------------|
| **Torque** | Low | High (multiplied by gear ratio) |
| **Speed** | High | Low (reduced by gear ratio) |
| **Back-drive** | Yes (gravity can move arm) | Limited (gears prevent it) |
| **Complexity** | Simple | More components |
| **Efficiency** | High | Medium (friction losses) |
| **Control Precision** | Medium | High (gear reduction enables fine control) |
| **Weight** | Lighter | Heavier |

Most humanoid joints use geared drives for torque multiplication, except where direct drive is needed for force sensing.

---

## Actuation Integration: Power Distribution

Complex humanoid robots require sophisticated power distribution systems:

1. **Power Source**: Battery pack (LiPo, Li-ion) or fuel cell
2. **Battery Management System (BMS)**: Monitors cell voltage, temperature, and manages charging/discharging
3. **Voltage Regulation**: Converts main battery voltage to different levels for:
   - Motor controllers (typically 24-48V)
   - Computation systems (12V, 5V, 3.3V)
   - Sensor power supplies

4. **Current Distribution**: Uses buses and contactors to route power efficiently
5. **Energy Management**: Allocates power budgets to tasks, shuts down non-critical systems when power is low

Example: Boston Dynamics Atlas allocates power dynamically—prioritizing leg actuators for balance during walking, then arm actuators for manipulation.

---

## Sensor-Actuator Feedback Loops

Effective robot control requires tight integration of sensing and actuation:

1. **Position Control**: Joint encoder feedback enables servo control to achieve target positions
2. **Force Control**: Force/torque sensor feedback enables impedance control for safe manipulation
3. **Velocity Control**: Tachometers (motor speed sensors) enable smooth acceleration and deceleration
4. **Compliance Control**: Combining position and force feedback allows dynamic compliance (stiffness) adjustment

These feedback loops operate at control frequencies of 100-1000 Hz, requiring low-latency sensors and actuators.

