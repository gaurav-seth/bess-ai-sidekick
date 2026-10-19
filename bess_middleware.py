from langchain.agents.middleware import before_agent, after_agent, wrap_tool_call 


@before_agent
def log_agent_start(state, runtime):
    """Log when the BESS agent starts processing a request."""
    print("\n[Middleware] BESS agent execution started.")


@after_agent
def log_agent_finish(state, runtime):
    """Log when the BESS agent finishes processing a request."""
    print("[Middleware] BESS agent execution finished.\n")

@wrap_tool_call
def log_tool_call(request, handler):
    """Log tool calls and allow them to execute normally."""
    tool_name = request.tool_call["name"]
    print(f"[Tool] {tool_name} called.")
    return handler(request)