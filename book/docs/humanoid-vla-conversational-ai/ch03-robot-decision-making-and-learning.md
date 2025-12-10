import ChapterTools from '@site/src/components/ChapterTools';

<ChapterTools />

# Chapter 2: Robot Decision Making and Learning

Perception provides the raw understanding of the world; decision making is the process by which a robot chooses what to do with that understanding. This involves everything from high-level strategic planning to low-level motor control. Modern robots, especially those operating in complex human environments, increasingly rely on artificial intelligence and machine learning to make these decisions.

### Traditional Robotics: Planning and Control

Historically, robot decision-making has been rooted in classical AI planning and control theory.

*   **State-Space Search:** For well-defined problems (like moving blocks in a factory), a robot can represent its world as a set of states (e.g., "block A is on table," "robot hand is empty") and actions that transition between states (e.g., "pick up block A"). The robot then uses search algorithms (like A* search) to find a sequence of actions that leads from its current state to a desired goal state. This is effective for predictable, static environments.

*   **Control Theory:** For lower-level tasks like maintaining balance or following a trajectory, robots use control loops. A **PID (Proportional-Integral-Derivative) controller**, for example, is a widely used feedback mechanism. It continuously calculates an "error" (the difference between the desired state and the actual state) and adjusts the robot's actuators to minimize that error. If a walking robot leans too far left, the PID controller might command the ankle motor to push harder to the right to restore balance.

The limitation of these traditional approaches is their reliance on perfect models of the world and precise programming of every possible scenario. The real world is rarely so neat.

### Learning from Experience: Reinforcement Learning

For robots to operate robustly in uncertain and dynamic environments, they need to learn. **Reinforcement Learning (RL)** is a powerful paradigm where an agent learns to make decisions by trial and error, much like how animals learn.

*   **Agent:** The robot itself.
*   **Environment:** The physical world the robot operates in.
*   **State:** The current observation of the environment (e.g., robot's joint angles, sensor readings, object positions).
*   **Action:** A movement or decision the robot can make.
*   **Reward:** A scalar signal from the environment that tells the robot how good or bad its last action was.

The goal of the robot is to maximize its cumulative reward over time. An RL algorithm will explore different actions in various states and, through repeated interactions, learn a **policy**—a mapping from states to actions that leads to the highest reward.

**Example:** Teaching a robot to walk using RL.
*   **State:** The robot's current pose, velocity, and forces on its feet.
*   **Actions:** Adjusting the torque on its hip, knee, and ankle joints.
*   **Reward:** Positive reward for staying upright and moving forward; negative reward for falling or moving backward.

Initially, the robot will flail randomly, fall frequently, and receive negative rewards. But over millions of simulated or real-world trials, it will gradually discover a walking gait that optimizes its reward function. This approach has led to breakthroughs in tasks like bipedal walking, grasping novel objects, and even complex acrobatic maneuvers for robots like Atlas.

### Transfer Learning and Sim-to-Real

Training robots with RL directly in the real world can be dangerous, expensive, and time-consuming. This is where **sim-to-real transfer** comes in. Robots are often trained in high-fidelity physics simulators, where millions of trials can be run in parallel, much faster than real-time.

Once a good policy is learned in simulation, it can be transferred to the real robot. This transfer often requires techniques like **domain randomization** (training the robot in simulation with a wide variety of textures, lighting, and physics parameters) and **domain adaptation** (fine-tuning the learned policy on a small amount of real-world data). This allows robots to leverage the speed of simulation while still performing robustly in the physical world.
