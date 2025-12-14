# MCP Test Kit

> **A comprehensive testing framework for Model Context Protocol (MCP) servers**

[![npm version](https://img.shields.io/npm/v/@crashbytes/mcp-test-kit.svg)](https://www.npmjs.com/package/@crashbytes/mcp-test-kit)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 📖 Table of Contents

- [What is MCP?](#-what-is-mcp)
- [What is MCP Test Kit?](#-what-is-mcp-test-kit)
- [Why Use MCP Test Kit?](#-why-use-mcp-test-kit)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [Core Concepts](#-core-concepts)
- [API Reference](#-api-reference)
- [Examples](#-examples)
- [Best Practices](#-best-practices)
- [Contributing](#-contributing)
- [License](#-license)

## 🤔 What is MCP?

**Model Context Protocol (MCP)** is an open protocol developed by Anthropic that enables AI assistants like Claude to securely interact with external tools, data sources, and services. Think of it as a standardized way for AI models to:

- **Access tools**: Execute functions like searching databases, calling APIs, or running calculations
- **Read resources**: Fetch data from files, databases, or external services
- **Use prompts**: Leverage pre-built prompt templates for common tasks

### Real-World MCP Examples

Here are some practical MCP servers you might build:

1. **Weather Server**: Provides current weather data for any city
2. **Database Server**: Allows querying a PostgreSQL/MySQL database
3. **File System Server**: Enables reading/writing files on disk
4. **API Integration Server**: Connects to third-party APIs (GitHub, Slack, etc.)
5. **Calculator Server**: Performs complex mathematical operations

### How MCP Works

```
┌─────────────┐         ┌──────────────┐         ┌──────────────┐
│   Claude    │ ←─MCP──→│  MCP Server  │ ←──────→│  Your Data   │
│  (Client)   │         │  (Your Code) │         │  or Service  │
└─────────────┘         └──────────────┘         └──────────────┘
```

The MCP server acts as a bridge between Claude and your data/services, exposing them through a standardized protocol.

## 🎯 What is MCP Test Kit?

**MCP Test Kit** is a testing framework that makes it easy to write automated tests for your MCP servers. It provides:

### 🔧 Core Features

1. **MCPTestClient**: A test client that connects to your MCP server and calls its tools/resources
2. **Custom Vitest Matchers**: Specialized assertions for validating MCP responses
3. **Mock Server**: Create fake MCP servers for testing client code
4. **TypeScript Support**: Full type definitions for better IDE support and type safety

### 🎪 The Problem It Solves

Without MCP Test Kit, testing an MCP server is challenging:

- ❌ You need to manually start the server and interact with it
- ❌ No standardized way to assert MCP-specific behaviors
- ❌ Complex setup for integration tests
- ❌ Hard to test error conditions and edge cases

**With MCP Test Kit:**

- ✅ Programmatically start and stop your server in tests
- ✅ Use intuitive matchers like `toBeValidMCPTool()` and `toMatchMCPToolResponse()`
- ✅ Write comprehensive integration tests in minutes
- ✅ Easily test error handling and edge cases

## 💡 Why Use MCP Test Kit?

### For MCP Server Developers

If you're building an MCP server, MCP Test Kit helps you:

- **Verify correctness**: Ensure your server implements the MCP protocol correctly
- **Test tools**: Validate that your tools return the expected results
- **Test resources**: Confirm resources are accessible and return proper data
- **Test error handling**: Verify error responses follow MCP standards
- **Regression testing**: Catch bugs before they reach production
- **Documentation**: Tests serve as living documentation of your server's behavior

### Example Use Case

Let's say you built a weather MCP server. With MCP Test Kit, you can write tests like:

```typescript
it('should return weather data for San Francisco', async () => {
  const result = await client.callTool('get-weather', { 
    city: 'San Francisco' 
  });
  
  expect(result).toMatchMCPToolResponse();
  expect(result.content[0].text).toContain('temperature');
  expect(result.content[0].text).toContain('San Francisco');
});

it('should handle invalid city names', async () => {
  await expect(
    client.callTool('get-weather', { city: '' })
  ).rejects.toMatchMCPError({
    code: -32602,
    message: /invalid.*city/i
  });
});
```

## 📦 Installation

```bash
# Using npm
npm install --save-dev @crashbytes/mcp-test-kit

# Using yarn
yarn add -D @crashbytes/mcp-test-kit

# Using pnpm
pnpm add -D @crashbytes/mcp-test-kit
```

### Prerequisites

- Node.js 18+ 
- A testing framework (Vitest recommended)
- TypeScript (optional, but recommended)

## 🚀 Quick Start

### 1. Create Your First Test

```typescript
// tests/weather-server.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMCPTestClient } from '@crashbytes/mcp-test-kit';
import type { MCPTestClient } from '@crashbytes/mcp-test-kit';
import '@crashbytes/mcp-test-kit/matchers';

describe('Weather MCP Server', () => {
  let client: MCPTestClient;

  beforeAll(async () => {
    // Connect to your MCP server
    client = await createMCPTestClient({
      command: 'node',
      args: ['dist/server.js'],
    });
  });

  afterAll(async () => {
    await client.disconnect();
  });

  it('should list available tools', async () => {
    const tools = await client.listTools();
    
    expect(tools).toHaveLength(1);
    expect(tools[0]).toBeValidMCPTool();
    expect(tools[0].name).toBe('get-weather');
  });

  it('should get weather for a city', async () => {
    const result = await client.callTool('get-weather', {
      city: 'London',
    });

    expect(result).toMatchMCPToolResponse();
    expect(result.content[0].text).toContain('London');
  });
});
```

### 2. Run Your Tests

```bash
npm test
```

That's it! You're now testing your MCP server.

## 🧩 Core Concepts

### MCPTestClient

The `MCPTestClient` is your main interface for testing MCP servers. It:

- Spawns your MCP server as a subprocess
- Establishes a connection using the MCP protocol
- Provides methods to call tools, list resources, etc.
- Handles cleanup when tests complete

**Key Methods:**

- `listTools()`: Get all available tools from the server
- `callTool(name, args)`: Execute a tool with arguments
- `listResources()`: Get all available resources
- `readResource(uri)`: Read a specific resource
- `listPrompts()`: Get all available prompts
- `getPrompt(name, args)`: Get a specific prompt

### Custom Matchers

MCP Test Kit provides custom Vitest matchers for MCP-specific assertions:

#### `toBeValidMCPTool()`

Validates that an object is a properly formatted MCP tool:

```typescript
const tool = {
  name: 'calculate',
  description: 'Performs calculations',
  inputSchema: {
    type: 'object',
    properties: {
      expression: { type: 'string' }
    }
  }
};

expect(tool).toBeValidMCPTool();
```

#### `toBeValidMCPResource()`

Validates that an object is a properly formatted MCP resource:

```typescript
const resource = {
  uri: 'file:///data/users.json',
  name: 'Users Database',
  description: 'List of all users'
};

expect(resource).toBeValidMCPResource();
```

#### `toMatchMCPToolResponse()`

Validates the structure of a tool response:

```typescript
const response = await client.callTool('get-weather', { city: 'Paris' });

expect(response).toMatchMCPToolResponse();
expect(response.content[0].text).toContain('Paris');
```

#### `toMatchMCPError(error)`

Validates MCP error responses:

```typescript
await expect(
  client.callTool('invalid-tool', {})
).rejects.toMatchMCPError({
  code: -32601, // Method not found
  message: /not found/i
});
```

#### `toHaveMCPProtocolVersion(version)`

Validates the MCP protocol version:

```typescript
const info = await client.getServerInfo();
expect(info).toHaveMCPProtocolVersion('2024-11-05');
```

## 📚 API Reference

### createMCPTestClient(config)

Creates and connects to an MCP test client.

**Parameters:**

```typescript
interface MCPTestClientConfig {
  command: string;           // Command to run (e.g., 'node', 'python')
  args?: string[];          // Arguments for the command
  env?: Record<string, string>; // Environment variables
  timeout?: number;         // Timeout in milliseconds (default: 5000)
  transport?: 'stdio';      // Transport type (only stdio supported)
  debug?: boolean;          // Enable debug logging
}
```

**Returns:** `Promise<MCPTestClient>`

**Example:**

```typescript
const client = await createMCPTestClient({
  command: 'node',
  args: ['dist/server.js'],
  env: {
    NODE_ENV: 'test',
    DATABASE_URL: 'sqlite::memory:'
  },
  timeout: 10000,
  debug: true
});
```

### MCPTestClient Methods

#### `listTools(): Promise<MCPTool[]>`

Lists all tools available on the MCP server.

```typescript
const tools = await client.listTools();
console.log(tools[0].name); // 'get-weather'
```

#### `callTool(name: string, args?: object): Promise<MCPToolResult>`

Executes a tool with the given arguments.

```typescript
const result = await client.callTool('calculate', {
  expression: '2 + 2'
});
```

#### `listResources(): Promise<MCPResource[]>`

Lists all resources available on the MCP server.

```typescript
const resources = await client.listResources();
console.log(resources[0].uri); // 'file:///data/users.json'
```

#### `readResource(uri: string): Promise<MCPResourceContent>`

Reads the content of a specific resource.

```typescript
const content = await client.readResource('file:///data/users.json');
console.log(content.text);
```

#### `listPrompts(): Promise<MCPPrompt[]>`

Lists all prompts available on the MCP server.

```typescript
const prompts = await client.listPrompts();
```

#### `getPrompt(name: string, args?: Record<string, string>): Promise<unknown>`

Gets a specific prompt with arguments.

```typescript
const prompt = await client.getPrompt('code-review', {
  language: 'typescript'
});
```

#### `disconnect(): Promise<void>`

Disconnects from the MCP server and cleans up resources.

```typescript
await client.disconnect();
```

## 💻 Examples

### Example 1: Testing a Calculator Server

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMCPTestClient, MCPTestClient } from '@crashbytes/mcp-test-kit';
import '@crashbytes/mcp-test-kit/matchers';

describe('Calculator MCP Server', () => {
  let client: MCPTestClient;

  beforeAll(async () => {
    client = await createMCPTestClient({
      command: 'node',
      args: ['dist/calculator-server.js'],
    });
  });

  afterAll(async () => {
    await client.disconnect();
  });

  describe('Basic Operations', () => {
    it('should add two numbers', async () => {
      const result = await client.callTool('calculate', {
        operation: 'add',
        a: 5,
        b: 3
      });

      expect(result).toMatchMCPToolResponse();
      expect(result.content[0].text).toBe('8');
    });

    it('should handle division by zero', async () => {
      await expect(
        client.callTool('calculate', {
          operation: 'divide',
          a: 10,
          b: 0
        })
      ).rejects.toMatchMCPError({
        code: -32602,
        message: /division by zero/i
      });
    });
  });

  describe('Tool Validation', () => {
    it('should have valid tool schema', async () => {
      const tools = await client.listTools();
      const calcTool = tools.find(t => t.name === 'calculate');

      expect(calcTool).toBeValidMCPTool();
      expect(calcTool?.inputSchema.properties).toHaveProperty('operation');
      expect(calcTool?.inputSchema.properties).toHaveProperty('a');
      expect(calcTool?.inputSchema.properties).toHaveProperty('b');
    });
  });
});
```

### Example 2: Testing a Database Server

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createMCPTestClient, MCPTestClient } from '@crashbytes/mcp-test-kit';
import '@crashbytes/mcp-test-kit/matchers';

describe('Database MCP Server', () => {
  let client: MCPTestClient;

  beforeAll(async () => {
    client = await createMCPTestClient({
      command: 'node',
      args: ['dist/db-server.js'],
      env: {
        DATABASE_URL: 'sqlite::memory:',
        NODE_ENV: 'test'
      }
    });
  });

  afterAll(async () => {
    await client.disconnect();
  });

  it('should query users from database', async () => {
    const result = await client.callTool('query', {
      sql: 'SELECT * FROM users WHERE age > 18'
    });

    expect(result).toMatchMCPToolResponse();
    const data = JSON.parse(result.content[0].text);
    expect(Array.isArray(data)).toBe(true);
  });

  it('should list database resources', async () => {
    const resources = await client.listResources();

    expect(resources.length).toBeGreaterThan(0);
    resources.forEach(resource => {
      expect(resource).toBeValidMCPResource();
    });
  });

  it('should read table schema', async () => {
    const content = await client.readResource('schema://users');
    
    expect(content.text).toContain('id');
    expect(content.text).toContain('name');
    expect(content.text).toContain('email');
  });
});
```

### Example 3: Testing with Mocks

```typescript
import { describe, it, expect } from 'vitest';
import { createMockMCPServer, mockTool } from '@crashbytes/mcp-test-kit/mocks';

describe('Mock MCP Server', () => {
  it('should create a mock server with tools', async () => {
    const server = createMockMCPServer({
      tools: [
        mockTool(
          'greet',
          async (args) => ({
            content: [{ type: 'text', text: `Hello, ${args.name}!` }]
          }),
          {
            description: 'Greets a person',
            inputSchema: {
              type: 'object',
              properties: {
                name: { type: 'string' }
              }
            }
          }
        )
      ]
    });

    const tools = server.getTools();
    expect(tools).toHaveLength(1);
    expect(tools[0].name).toBe('greet');

    const result = await server.callTool('greet', { name: 'World' });
    expect(result.content[0].text).toBe('Hello, World!');
  });
});
```

## 🎓 Best Practices

### 1. Use beforeAll/afterAll for Connection Management

```typescript
let client: MCPTestClient;

beforeAll(async () => {
  client = await createMCPTestClient({ /* config */ });
});

afterAll(async () => {
  await client.disconnect();
});
```

### 2. Test Both Success and Failure Cases

```typescript
// Test success
it('should return data for valid input', async () => {
  const result = await client.callTool('tool', { valid: true });
  expect(result).toMatchMCPToolResponse();
});

// Test failure
it('should reject invalid input', async () => {
  await expect(
    client.callTool('tool', { invalid: true })
  ).rejects.toMatchMCPError({ code: -32602 });
});
```

### 3. Validate Tool Schemas

```typescript
it('should have properly defined tools', async () => {
  const tools = await client.listTools();
  
  tools.forEach(tool => {
    expect(tool).toBeValidMCPTool();
    expect(tool.description).toBeTruthy();
    expect(tool.inputSchema.properties).toBeDefined();
  });
});
```

### 4. Use Descriptive Test Names

```typescript
// ❌ Bad
it('test 1', async () => { /* ... */ });

// ✅ Good
it('should return weather data for valid city names', async () => { /* ... */ });
```

### 5. Isolate Tests

Each test should be independent and not rely on state from other tests.

```typescript
// ❌ Bad - Tests depend on order
it('creates a user', async () => { /* ... */ });
it('updates the user', async () => { /* assumes user exists */ });

// ✅ Good - Each test is independent
beforeEach(async () => {
  await client.callTool('reset-database', {});
});

it('creates a user', async () => { /* ... */ });
it('updates a user', async () => {
  await client.callTool('create-user', { name: 'Test' });
  await client.callTool('update-user', { name: 'Updated' });
});
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Setup

```bash
# Clone the repository
git clone https://github.com/crashbytes/mcp-test-kit.git
cd mcp-test-kit

# Install dependencies
npm install

# Build the project
npm run build

# Run tests
npm test

# Run linter
npm run lint
```

## 📄 License

MIT © [Blackhole Software LLC](https://crashbytes.com)

## 🔗 Links

- **NPM Package**: https://www.npmjs.com/package/@crashbytes/mcp-test-kit
- **GitHub**: https://github.com/crashbytes/mcp-test-kit
- **MCP Specification**: https://spec.modelcontextprotocol.io/
- **CrashBytes Blog**: https://crashbytes.com

## 🙏 Acknowledgments

- [Anthropic](https://anthropic.com) for creating the Model Context Protocol
- [Vitest](https://vitest.dev) for the excellent testing framework
- The MCP community for feedback and contributions

---

**Built with ❤️ by [CrashBytes](https://crashbytes.com)**
