# Chapter 3: Sensors and Actuators - Practical Examples

## Environment Mapping with Visual Sensors

### LiDAR for Indoor Navigation

Boston Dynamics Atlas uses a spinning LiDAR unit to map its environment:
- **Sensor**: 32-channel LiDAR scanning at 10Hz, providing 360-degree awareness
- **Processing**: Raw point cloud processed to identify walkable surfaces, obstacles, and terrain height variations
- **Application**: Enables autonomous navigation through warehouses, construction sites, and unstructured environments
- **Advantage**: Works in various lighting conditions; provides metric distance measurements
- **Limitation**: Cannot detect transparent objects or distinguish material properties

### Depth Cameras for Close-Range Perception

Social humanoid robot Sophia uses RGB-D (depth) cameras:
- **Sensor Configuration**: Two RGB-D cameras for stereo vision (closer to human vision)
- **Use Cases**: Face recognition at ~1m range, gesture recognition, object identification
- **Advantage**: Lower cost than LiDAR, good for fine-grained details
- **Limitation**: Limited range (~5m), struggles outdoors with infrared interference

### Multi-Camera Fusion in Tesla Humanoid (Optimus)

Tesla's proposed humanoid robot plans multi-camera perception:
- **Sensor Suite**: 8 cameras with different focal lengths for comprehensive coverage
- **Integration**: Feeds into neural network for real-time object detection
- **Advantage**: Redundancy; different focal lengths cover near and far objects
- **Challenge**: High computational load for processing multiple video streams simultaneously

---

## Tactile Sensing for Dexterous Manipulation

### Force Control in Robotic Surgery

Intuitive Surgical's da Vinci surgical system employs force-feedback:
- **Sensors**: Force/torque sensors at instrument tip detect resistance during tissue manipulation
- **Feedback**: Surgeon receives haptic feedback about tissue resistance
- **Precision**: Forces measured to ~0.1N, enabling delicate manipulation without tearing tissue
- **Impact**: Enables minimally invasive surgery with reduced patient trauma

### Slip Detection in Mobile Manipulation

Mobile manipulators like FETCH Robotics use slip sensors in grippers:
- **Sensors**: Micro-motion sensors detect when objects begin slipping
- **Control Algorithm**: When slip detected, gripper increases pressure or re-adjusts grip
- **Advantage**: Prevents object drops without crushing fragile items
- **Real-World Use**: Picking items from shelves in warehouses without damage

### Soft Touch in Collaborative Robots

Universal Robots' collaborative arm (UR10) uses wrist-mounted force/torque sensors:
- **Sensor Data**: Continuously monitors interaction forces with humans
- **Safety Response**: Detects unexpected collisions (force spikes) and stops within milliseconds
- **Compliance**: Allows teach-by-demonstration where humans can guide the arm
- **Certification**: Force-limited motion certified safe for human-robot collaboration per ISO/TS 15066

---

## Actuator Performance in Dynamic Tasks

### Hydraulic Power in Boston Dynamics Atlas

Atlas leverages hydraulic actuation for dynamic mobility:
- **Actuators**: Hydraulic cylinders in all joints; hydraulic pump driven by electric motor
- **Performance**: Enables backflips, explosive jumps, and recovery from falls
- **Power Density**: Hydraulics deliver 5-10× the power per unit weight compared to electric motors
- **Challenge**: Fluid leaks are environmental hazard; complex system with many failure points
- **Maintenance**: Requires filter changes and fluid inspection

**Example Maneuver**: Atlas performing a backflip
1. Hydraulic legs compress rapidly, storing energy
2. Lower body actuators fire in sequence to generate upward momentum
3. Upper body rotates to control rotation
4. Landing requires precise ankle and knee control to absorb impact
5. Entire sequence: ~0.5 seconds

### Series Elastic Actuators in Rethink Robotics Baxter

Baxter arm uses Series Elastic Actuators for safe human-robot interaction:
- **Design**: Spring between motor and end-effector; force sensor measures spring compression
- **Benefits**: 
  - Compliant movement (won't injure humans on contact)
  - Accurate force control for delicate tasks
  - Force feedback enables learning from demonstration
- **Performance Tradeoff**: Lower response speed (~50Hz control vs 1000Hz for stiff actuators)
- **Application**: Manufacturing assembly with human oversight

---

## Integrated Sensor-Actuator Systems

### Mobile Manipulation in Mobile Bases with Arm

Example: Fetch Mobile Manipulator in warehouse automation
- **Locomotion Sensors**: 
  - LiDAR for obstacle avoidance during navigation
  - Wheel encoders for odometry tracking
  - Bumpers for collision detection
- **Manipulation Sensors**:
  - Joint encoders on arm for positioning
  - Gripper force sensor for object detection and secure grasp
  - RGB-D camera for object localization
- **Integration Challenge**: Coordinating multiple control loops:
  - Navigation loop (10Hz): Plan path avoiding obstacles
  - Arm motion loop (100Hz): Move arm to manipulate objects
  - Gripper force loop (1000Hz): Adjust grip to prevent slip
- **Real-World Scenario**: Pick item from shelf
  1. Navigate to shelf using LiDAR-based SLAM
  2. Recognize item using RGB-D camera
  3. Move arm to reach item (joint encoder feedback)
  4. Close gripper until force sensor detects item (50-100N)
  5. Lift with controlled acceleration
  6. Navigate to delivery location
  7. Gently release item

### Vision-Based Manipulation in KUKA LBR iiwa

KUKA's sensitive lightweight robot combines advanced sensing and control:
- **Sensors**: 
  - 7 joint torque sensors (extremely sensitive)
  - Wrist-mounted force/torque sensor
  - 3D camera for object recognition
- **Control Strategy**: 
  - Torque feedback enables detection of contact with ~100mN sensitivity
  - Can detect when placing object on surface (force rises gradually)
  - Enables tasks like egg cracking (apply controlled force without crushing)
- **Application**: Delicate assembly, contact-rich manipulation

---

## Sensor Failure and Redundancy

### Handling Sensor Degradation in Atlas

Boston Dynamics Atlas incorporates redundancy:
- **LiDAR Failure**: Backup stereo cameras can provide environment estimates
- **Joint Encoder Failure**: Can estimate joint angle from motor current and commanded torque
- **IMU Failure**: Fuse remaining accelerometers and gyroscopes from other units
- **Graceful Degradation**: Robot continues operating at reduced capability rather than immediate shutdown

### Multi-Sensor Fusion in Autonomous Vehicles

Self-driving cars employ redundant sensor suites:
- **Primary**: LiDAR for 3D mapping
- **Secondary**: Radar for velocity estimation
- **Tertiary**: Stereo cameras for object classification
- **Advantage**: If one sensor fails, vehicle has fallback perception
- **Example**: Waymo vehicles continue operating with 2 of 3 primary sensors failed

These practical examples illustrate how sensor-actuator selection and integration directly determine robot capability and reliability in real-world tasks.

