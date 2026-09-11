# Hermes AI Platform Setup and Optimization Guide

## Overview
Hermes is a free, open-source AI platform developed by Nous Research, designed to create and run autonomous agents for various tasks, including research, summarization, and real-time updates. It supports both local execution and virtual private server (VPS) deployment for continuous operation, allowing it to operate independently of your computer's uptime.

## Key Features
- **One-Click Setup**: Simplifies local AI setup with a single click.
- **Local Execution**: Ensures privacy with models running entirely on the user's machine.
- **Automatic Management**: 
  - Manages the inference engine (llama.cpp) and selects appropriate model builds.
  - Handles memory management, context sizes, GPU layers, and quantization levels.
- **Bots Mode**: Allows creation of group chats with 2-6 bots, each with a unique profile.
- **Agent-to-Agent Messaging**: Enables bots to communicate and tag each other for tasks.
- **Persistent Multi-Gateway Connections**: Connects multiple backends (local, remote, SSH, cloud) simultaneously.
- **Live Sub-Agent Steering**: Real-time management of sub-agents.
- **Reduced Context Usage**: Default context usage cut by about half.
- **Open Source License**: MIT

## Technical Specifications
- **Server Requirement**: Small rented server (e.g., KVM 1 plan)
- **AI Model Provider**: OpenRouter or Nous Portal
- **Shared Memory Vault**: Utilizes an Obsidian vault for shared context across agents.
- **Connection Types**: Local, Remote Gateway, SSH, Hosted Hermes Cloud Instance.
- **Device Naming**: Each connection requires a unique device name for identification.
- **Fleet Management**: Sidebar displays all registered machines and their agents.

## Setup Instructions

### Local Setup
1. **Initial Setup**:
   - Navigate to `Settings` > `Providers` > `Local Models`.
   - Select `Run models locally` during onboarding.
   - Click `Install Runtime` to download and verify the llama.cpp build.

2. **Model Selection**:
   - Choose a model from the catalog.
   - Click `Download`, then `Use` to start running AI locally.

3. **Model Management**:
   - Compatibility checks and memory fit color-coding: Green (fits GPU), Amber (uses system RAM), Red (too large).
   - Context windows and download sizes tailored to hardware.

### Server Setup
1. **Choose a Hosting Provider**: Use a provider with a one-click Hermes template.
2. **Select Plan**: Start with the KVM 1 plan.
3. **Deployment**: Follow the hosting provider's flow to deploy Hermes. Save the admin username and password securely.

### AI Model Configuration
1. **OpenRouter Account**: Sign up at [openrouter.ai](https://openrouter.ai) and obtain an API key.
2. **Set API Key**: In the Hermes dashboard, navigate to `Keys`, find OpenRouter, and set your API key.
3. **Select Model**: Go to `Models` and choose a model like `DeepSeek-V4-Flash`.

### Telegram Integration
1. **Create Telegram Bot**: In the Hermes dashboard, go to `Channels` and create a Telegram bot using the QR code.
2. **Set Home Channel**: Use `/sethome` in Telegram to set the home channel for notifications.

### Desktop App Installation
1. **Download App**: Visit [hermes-agent.nousresearch.com](https://hermes-agent.nousresearch.com) and download the app for your OS.
2. **Connect to Server**: In the app, go to `Settings -> Gateway`, select `Remote Gateway`, and enter your server URL.

## Advanced Features
- **Memory Management**: 
  - Models start with a context window that fits the GPU and expand as needed.
  - Overflow managed by using system RAM strategically.
  - Unused models unload after 15 minutes to free memory.

- **Resource Monitoring**: Enable system resources view for live GPU and RAM usage.

- **Identity Configuration (Soul MD)**:
  - Defines the agent's personality and response style.
  - Configure tone, formatting rules, and preferences.

- **Tools and Skills**:
  - Tools: Single actions like web search or file reading.
  - Skills: Playbooks combining tools to complete tasks. Hermes auto-generates skills from past tasks.

- **External Communication**:
  - **WhatsApp Integration**: Connects via a QR code.
  - **Allow List**: Ensure phone number is formatted and added to allow list.
  - **Unauthorized DM Behavior**: Set to ignore.

- **Security and Configuration**:
  - Terminal Backend set to Docker to sandbox operations.

## Task Automation
- **Cron Jobs**: Schedule tasks like checking inbox, calendar, and market data.
- **Home Channel**: Specify WhatsApp conversation for task outputs.

## Usage and Customization
- **Preferences**: Correct Hermes in plain language to set preferences.
- **Skills and Schedule**: Use the `Capabilities` page to view and manage skills. Schedule tasks using `Schedule Jobs`.
- **Sub-agents**: Utilize sub-agents for parallel task execution.

## Testing Scenarios
1. **SEO ROI Calculator**:
   - **Task**: Create an HTML page with inputs for monthly traffic, conversion rate, average order value, and estimated SEO lift.
   - **Purpose**: Evaluate agent's ability to execute a straightforward task without additional instructions.

2. **SEO Audit Landing Page**:
   - **Task**: Develop a landing page with sections for headline, benefits, form, testimonials, FAQ, and call-to-action buttons.
   - **Purpose**: Test agent's capability to manage multiple tasks and maintain structure.

## Troubleshooting
- **Logs**: Check `Logs` in the dashboard for errors.
- **Restart Gateway**: Use `Restart Gateway` if issues arise.
- **Docker Manager**: Restart the application via the Docker Manager if needed.

## Maintenance
- **Monitor Costs**: Use the OpenRouter activity page to track usage and spending.
- **Model Switching**: Change models as needed via the model selector or slash commands in Telegram.

## Conclusion
Hermes Agent provides a robust AI solution capable of automating tasks and learning over time. The latest update enhances multi-agent collaboration and connectivity, offering significant improvements in efficiency and task management. It is suitable for users seeking a persistent AI assistant that operates independently and securely.