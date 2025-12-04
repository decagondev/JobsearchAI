# BotAI - Intelligent Bot Platform

A modern web application for building and deploying AI-powered chatbots, featuring a multi-mode support bot with Groq AI integration.

## Features

- **Multi-Mode Support Bot**: Three specialized bot modes:
  - **Sales Bot**: Helps users hire BotAI for chatbot and AI solutions (llama-3.1-8b-instant)
  - **Tutor Bot**: Educational bot teaching about chatbots and BotAI services (meta-llama/llama-4-scout-17b-16e-instruct)
  - **Raggy Bot**: Upload documents (PDF, Markdown, HTML, JS, TS, CSS, JSON, TXT) and chat about them with vector-based RAG (meta-llama/llama-4-maverick-17b-128e-instruct)
- **Document Processing**: Upload and analyze multiple file types with intelligent parsing
- **Vector-Based RAG**: In-memory vector database for semantic search and document retrieval
- **Resume Analysis**: Special handling for resume documents with career recommendations
- **Markdown Rendering**: Rich markdown support for bot responses
- **Persistent Chat History**: Chat history saved in IndexedDB with automatic persistence
- **Dark Mode**: Beautiful dark theme by default
- **Responsive Design**: Works seamlessly on all devices
- **Floating Chat Interface**: Minimizable and maximizable chat window
- **Multi-Page Navigation**: Landing, About, and Features pages

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get your API key from [Groq Console](https://console.groq.com/)

3. Run the development server:
```bash
npm run dev
```

## Tech Stack

- **Frontend Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4 with custom design system
- **AI Integration**: Groq SDK with multiple Llama models
- **Document Processing**: PDF.js for PDF parsing, custom parsers for other formats
- **Storage**: IndexedDB for persistent chat history and document storage
- **Routing**: React Router v7 for multi-page navigation
- **UI Components**: Radix UI primitives with custom components
- **Markdown**: react-markdown with GitHub Flavored Markdown support
- **Vector Search**: Custom in-memory vector database implementation

## Project Structure

```
src/
├── components/          # React components
│   ├── SupportBot.tsx  # Main chat interface
│   ├── MarkdownRenderer.tsx
│   ├── Navbar.tsx
│   └── ui/             # Reusable UI components
├── pages/              # Route pages
│   ├── Landing.tsx
│   ├── About.tsx
│   └── Features.tsx
├── lib/                # Core functionality
│   ├── groqClient.ts   # Groq API integration
│   ├── vectorDB.ts     # Vector database implementation
│   ├── fileParser.ts   # Document parsing
│   ├── pdfParser.ts    # PDF-specific parsing
│   ├── storage.ts      # IndexedDB wrapper
│   └── siteContext.json # Bot context data
└── main.tsx           # Application entry point
```

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GROQ_API_KEY=your_groq_api_key_here
```

Get your API key from [Groq Console](https://console.groq.com/)

## Usage

1. **Sales Bot Mode**: Ask questions about BotAI's services and how to hire the company for chatbot solutions
2. **Tutor Bot Mode**: Learn about chatbots, AI automation, and BotAI's features
3. **Raggy Bot Mode**: 
   - Upload documents (PDF, Markdown, HTML, JavaScript, TypeScript, CSS, JSON, TXT)
   - Chat about the uploaded documents
   - Special resume analysis with career recommendations
   - Multiple file support with vector-based semantic search

## License

See [LICENSE](LICENSE) file for details.
