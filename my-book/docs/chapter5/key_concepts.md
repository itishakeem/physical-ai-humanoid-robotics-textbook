# Chapter 5: AI Integration in Humanoids - Key Concepts

## Perception: Computer Vision and Sensor Fusion

### Convolutional Neural Networks (CNNs) for Vision

CNNs have revolutionized robot perception by enabling robust visual understanding:

**Architecture**:
- **Input Layer**: Raw image (e.g., 640×480 RGB = 3 channels)
- **Convolutional Layers**: Learn hierarchical features
  - Layer 1: Edges and corners (simple features)
  - Layer 2: Textures and shapes (medium complexity)
  - Layer 3: Object parts (high complexity)
  - Layer 4: Full objects (semantic level)
- **Pooling Layers**: Reduce computational load while preserving important features
- **Fully Connected Layers**: Produce final classification or detection outputs

**Common Architectures**:
- **ResNet-50**: Good balance of accuracy and speed; ~50 ms inference on GPU
- **YOLOv8**: Real-time object detection; 30-50 fps on robot hardware
- **SegFormer**: Semantic segmentation for scene understanding

### Reinforcement Learning for Skill Acquisition

**Policy Gradient Methods**:
- TRPO (Trust Region Policy Optimization): Guaranteed monotonic improvement
- PPO (Proximal Policy Optimization): Simpler, faster, most popular for robotics
- Actor-Critic: Efficient learning using both policy and value networks

**Hierarchical RL**: Multi-level policies for long-horizon tasks
- High-level: Task selection (1 Hz)
- Mid-level: Sub-task execution (10 Hz)
- Low-level: Motor control (100-1000 Hz)

**Key Challenge**: Sim-to-Real Transfer
- Domain randomization: Train on multiple environment variations
- System identification: Match simulator to real robot parameters
- Online adaptation: Adjust policy based on real robot feedback

---

## Natural Language Understanding

### Speech Recognition Pipeline

1. **Audio Capture**: Microphone array records speech
2. **Speech Recognition**: Convert audio to text (Whisper, etc.)
3. **Natural Language Understanding**: Extract intent and parameters
4. **Task Execution**: Convert intent to robot actions
5. **Response Generation**: Generate natural language response

### Vision-Language Models

Recent advances enable robots to understand scenes with natural language:

**CLIP (Contrastive Language-Image Pre-training)**:
- Learns joint embedding space for images and text
- Can match image content with text descriptions
- Application: Understand human instructions referring to visual scenes

**Example**: Human says "Hand me the blue cup near the window"
1. CLIP encodes image: Detects all objects (cups, windows, etc.)
2. CLIP encodes text: Matches "blue cup" to objects
3. Spatial reasoning: Identifies cup "near window"
4. Robot locates, grasps, and delivers cup

---

## Autonomous Navigation and Mapping

### SLAM (Simultaneous Localization and Mapping)

SLAM algorithms enable robots to explore unknown environments:

**Process**:
1. Robot explores environment with sensors
2. Detects features (corners, patterns) in sensor data
3. Associates features with previous observations
4. Estimates robot position from feature correspondences
5. Builds 3D map as robot moves

**Algorithms**:
- **ORB-SLAM**: Fast visual SLAM using feature matching
- **LiDAR-SLAM**: High-accuracy using laser scan matching
- **Graph-Based SLAM**: Optimizes entire trajectory retroactively

**Application**: Humanoid navigating office building
- Enters new floor with map
- Explores corridors, detecting walls and doorways
- Simultaneously estimates position and builds map
- After exploration, knows optimal routes between locations

### Path Planning

Once environment is mapped, path planning computes safe navigation:

**Dijkstra's Algorithm**: Finds shortest path in graph
- Nodes: Grid positions or waypoints
- Edges: Collision-free paths between adjacent positions
- Computation: ~1 ms for typical indoor environment

**RRT (Rapidly-Exploring Random Trees)**: Sample-based planner for high dimensions
- Randomly samples configuration space
- Connects samples if collision-free
- Very fast for high-dimensional problems (e.g., humanoid + arm)

**D* Lite**: Dynamic planning for replanning with cost updates
- Initial plan computed
- If obstacle detected, locally recomputes affected portions
- Much faster than recomputing entire plan

---

## Grasping and Manipulation with Learning

### Learning Grasp Prediction

Modern robots learn to grasp objects from images:

**Grasp Quality Metric**: Predicts probability of successful grasp given gripper position/orientation
- Input: RGB-D image + gripper position/approach vector
- CNN processes image: Detects object boundaries
- Predicts: Likelihood of stable grasp at each gripper position
- Output: Grasp pose with highest predicted quality

**Training Data**: Collected through:
- Physical exploration: Robot tries 10,000 grasps, tracks successes
- Simulation: Physics simulator generates synthetic grasp data
- Transfer learning: Pre-train on large dataset, fine-tune on robot

**Real-World Application**: Pick-and-place in warehouse
- Robot observes bin of mixed objects
- For each object, predicts best grasp from image
- Grasp prediction: 10-50 ms
- Success rate: 90-95% (compared to 60% for classical methods)

### Dexterous Manipulation

Learning to manipulate objects with multi-fingered hands:

**Challenge**: High-dimensional control (20+ degrees of freedom in hand)

**Approach**: Reinforcement learning in simulation, transfer to real robot

**Example**: Learning to rotate cube in-hand
- Simulator: Physics model of hand and cube
- Reward: Penalty for each step, bonus for reaching target rotation
- Training: 1-10 million simulation steps (hours of GPU time)
- Result: Policy that rotates cube using fingertip pushing
- Transfer: Domain randomization ensures learned skill works on real robot

---

## Predictive Models and Planning

### World Models

Some advanced systems learn predictive models of environment dynamics:

**Process**:
1. Collect experience: Robot performs random actions, observes results
2. Train model: Neural network learns to predict: next_state = f(state, action)
3. Planning: Use model to simulate potential actions
4. Execution: Execute best predicted action

**Advantage**: Can plan without physical execution (faster, safer)

**Challenge**: Prediction errors accumulate over long horizons

**Application**: Humanoid reaching in new environment
1. Look at target location
2. Imagine reaching trajectories using learned dynamics model
3. Select trajectory with highest predicted success
4. Execute trajectory
5. Observe actual result
6. Update model with new data

---

## Integration: Putting It All Together

### Complete Perception-Cognition-Action Loop

**Scenario**: "Bring me a red cup from the shelf"

**Perception** (0-100 ms):
- Vision system: Detect objects on shelf
- CNN: Classify objects → identify red cup
- Depth camera: Estimate 3D location of cup
- Robot internal state: Current arm position, gripper status

**Cognition** (100-500 ms):
- Symbolic reasoning: Decompose into sub-goals
  1. Navigate to shelf (if not there)
  2. Position arm to reach cup
  3. Grasp cup
  4. Lift and carry cup
  5. Navigate to human
  6. Present cup
- Path planning: Compute collision-free arm trajectory to cup
- Grasp prediction: Predict best grasp for cup shape
- Motion planning: Generate smooth joint trajectories

**Action** (500+ ms, ongoing):
- Arm motor control: Execute planned trajectory (classical control)
- Gripper force control: Grasp cup with appropriate force
- Locomotion: Walk to human (if needed)
- Recovery: If grasp fails, retry with different grasp point

**Learning**:
- Store this experience: Successful grasp of red cup
- Update grasp model: This cup shape + this approach angle = high success
- Update navigation model: Path used was efficient

**Result**: Next time robot encounters similar scenario, it executes faster and more reliably.

