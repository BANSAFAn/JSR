# Minecraft Java Finder

An application for determining the appropriate Java version for Minecraft (including release, beta, alpha, and snapshot versions). The program analyzes the user's system characteristics, suggests optimal Java versions, and provides links to reliable sources for downloading with detailed installation instructions.

## Features

- Determining the optimal Java version for any Minecraft version
- Support for all types of Minecraft versions (release, snapshots, beta, alpha)
- Analysis of computer system characteristics
- Providing links to verified sources for downloading Java
- Step-by-step installation instructions
- Multilingual interface (English, Russian, Ukrainian, German)
- Customizable themes (light, dark, neon)
- Cross-platform (Windows, Linux, Mac)

## Installation

### Downloading ready-made builds

Ready-made builds for Windows, Linux, and Mac are available in the [Releases](https://github.com/username/minecraft-java-finder/releases) section.

### Building from source code

```bash
# Clone the repository
git clone https://github.com/username/minecraft-java-finder.git
cd minecraft-java-finder

# Install dependencies
npm install

# Run the application in development mode
npm start

# Build the application for the current platform
npm run build
```

## Usage

1. Launch the application
2. Select the Minecraft version for which you need to determine the appropriate Java version
3. Click the "Analyze" button
4. The application will show the recommended Java version, the reason for the recommendation, and download links
5. Follow the installation instructions

## Configuration

### Language

To change the interface language, use the language selector in the upper right corner of the application. Available languages:
- English (default)
- Russian
- Ukrainian
- German

### Theme

To change the theme, use the theme selection buttons in the upper right corner of the application. Available themes:
- Light (default)
- Dark
- Neon

## Development

### Project Structure

```
├── assets/            # Application resources (images, icons)
├── locales/           # Localization files
├── src/               # TypeScript source files
├── styles/            # CSS styles
│   └── themes/        # Themes
├── .github/           # GitHub Actions configuration
├── dist/              # Compiled JavaScript files
├── index.html         # Main HTML file
├── tsconfig.json      # TypeScript configuration
└── package.json       # Project configuration
```

### Automatic Building and Releases

The project is configured for automatic building and release creation using GitHub Actions. When creating a tag with the prefix `v` (for example, `v1.0.0`), a release with ready-made builds for Windows, Linux, and Mac will be automatically created.

## License

MIT