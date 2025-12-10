import sys
import os

# Add project root for proper imports
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import chainlit as cl

# Import your agent safely
try:
    from src.agent.agent import agent as ai_agent
except Exception as e:
    print("ERROR importing agent:", e)
    ai_agent = None


@cl.on_chat_start
async def start():
    if ai_agent is None:
        await cl.Message(content="❌ Agent failed to load. Check import path `src.agent.agent`.").send()
        return

    # Store agent in session
    cl.user_session.set("agent", ai_agent)

    await cl.Message(
        content="Hello! I am your AI tutor for the Physical AI & Humanoid Robotics textbook. How can I help you?"
    ).send()


@cl.on_message
async def main(message: cl.Message):
    agent = cl.user_session.get("agent")

    # If agent not loaded correctly
    if agent is None:
        await cl.Message(content="❌ Agent is missing. Restart the chat or fix import path.").send()
        return

    # Agents library requires async `ask`
    try:
        response = await agent.ask(message.content)
    except AttributeError:
        await cl.Message(content="❌ Agent does not have an `.ask()` method.").send()
        return
    except Exception as e:
        await cl.Message(content=f"❌ Error while generating response: {str(e)}").send()
        return

    # Extract text safely
    if isinstance(response, str):
        final_output = response
    elif hasattr(response, "final_output"):  
        final_output = response.final_output
    elif hasattr(response, "output"):
        final_output = response.output
    else:
        final_output = str(response)

    await cl.Message(content=final_output).send()
