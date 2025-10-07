# GPT-5 Prompt Optimizer

A modern web application for optimizing prompts using GPT-5 best practices. This tool helps you transform basic prompts into well-structured, effective prompts following industry standards.

## Project Structure

```
GPT-5-PROMPT_OPTIMIZER/
├── index.html              # Main HTML file (entry point)
├── branch1.html            # Original monolithic version (deprecated)
├── css/
│   ├── styles.css          # Main application styles
│   └── DZBJpy2-RY.css      # Additional styles
├── js/
│   └── app.js              # Main application JavaScript
├── fonts/                  # KaTeX and OpenAI Sans fonts
├── images/                 # Application icons and images
├── prompt.md               # Prompt documentation
├── fixing.md               # Development notes
└── README.md               # This file
```

## Files Overview

### index.html
The main HTML file that contains the structure of the application. It includes:
- Sidebar with settings and configuration options
- Main content area with prompt editor
- Optimized prompt output panel with multiple view modes
- Links to external CSS and JavaScript files

### css/styles.css
Contains all the styling for the application, including:
- CSS custom properties for theming (light/dark mode)
- Responsive layout styles
- Component-specific styles (buttons, sliders, panels, etc.)
- Animations and transitions

### js/app.js
Contains all the application logic, including:
- Multi-language support (EN, ZH-CN, ZH-TW, ES, JA)
- Theme management (light/dark mode)
- API integration for prompt optimization
- Template management
- History tracking
- View mode switching (Raw, Structured, Comparison)
- Keyboard shortcuts

## Features

- **Multi-language Support**: English, Simplified Chinese, Traditional Chinese, Spanish, Japanese
- **Dark/Light Theme**: Automatic theme detection with manual toggle
- **Optimization Parameters**: Fine-tune accuracy, speed, brevity, creativity, and safety
- **Behavior Configuration**: Define desired and undesired behaviors
- **Templates**: Pre-built templates for common use cases
- **History**: Track and reload previous optimizations
- **Multiple Views**: Raw, Structured, and Comparison views for optimized prompts
- **Keyboard Shortcuts**: 
  - `Ctrl/Cmd + Enter`: Optimize prompt
  - `Ctrl/Cmd + S`: Save settings

## Usage

1. Open `index.html` in a modern web browser
2. Configure your API settings in the sidebar
3. Enter your original prompt
4. Adjust optimization parameters as needed
5. Click "Optimize Prompt" to generate an enhanced version
6. View results in different formats using the view toggle

## Configuration

The application requires:
- OpenAI API Base URL (default: `https://api.openai.com/v1`)
- OpenAI API Key
- Model Name (default: `gpt-5`)

Settings are persisted in browser localStorage.

## Development

This is a client-side application with no build process required. Simply:
1. Edit the HTML, CSS, or JavaScript files
2. Refresh your browser to see changes

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## License

[Your License Here]
