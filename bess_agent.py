
from langchain.agents import create_agent
from langchain_ollama import ChatOllama
from bess_middleware import log_agent_start, log_agent_finish, log_tool_call
import sqlite3
from langgraph.checkpoint.sqlite import SqliteSaver

from bess_tools import (
    get_battery_reading,
    get_battery_history,
    compare_latest_readings,
)


llm = ChatOllama(
    model="qwen2.5:3b-instruct",
    temperature=0,
)

connection = sqlite3.connect(
    "bess_memory.db",
    check_same_thread=False,
)

checkpointer = SqliteSaver(connection)
checkpointer.setup()

agent = create_agent(
    model=llm,
    tools=[
        get_battery_reading,
        get_battery_history,
        compare_latest_readings,
    ],
    middleware=[
        log_agent_start,
        log_agent_finish,
        log_tool_call,
    ],
    checkpointer=checkpointer,
    system_prompt=(
        "You are a BESS monitoring assistant. "
        "Use tools to retrieve actual battery telemetry. "
        "Base your answers on tool results. "
        "Never invent readings. If data is unavailable, say so. "
        "Explain changes clearly and distinguish measured facts "
        "from possible explanations. "
        "Provide informational support only; never control "
        "real battery equipment or make safety-critical decisions."
    ),
)

if __name__ == "__main__":
    question = input("Ask your BESS assistant: ")

    result = agent.invoke({
        "messages": [
            {"role": "user", "content": question}
        ]
    })

    print("\nBESS AI Sidekick:\n")

    for message in result["messages"]:
        if message.type == "ai" and message.content:
            print(message.content)
