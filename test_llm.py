
from langchain_ollama import ChatOllama

llm = ChatOllama(
    model="qwen2.5:3b-instruct",
    temperature=0,
)

response = llm.invoke(
    "Explain what a Battery Energy Storage System does in two sentences."
)

print(response.content)
