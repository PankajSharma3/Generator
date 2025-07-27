const express = require('express');
const archiver = require('archiver');
const Session = require('../models/Session');
const { auth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/export/component/:sessionId
// @desc    Export current component as ZIP
// @access  Private
router.get('/component/:sessionId', auth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    // Get session
    const session = await Session.findOne({ 
      _id: sessionId, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (!session.currentComponent) {
      return res.status(400).json({
        success: false,
        message: 'No component to export in this session'
      });
    }

    const component = session.currentComponent;
    const componentName = component.name || 'Component';
    const sanitizedName = componentName.replace(/[^a-zA-Z0-9]/g, '');

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedName}.zip"`);

    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Handle archive events
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({
        success: false,
        message: 'Error creating archive'
      });
    });

    // Pipe archive to response
    archive.pipe(res);

    // Generate package.json
    const packageJson = {
      name: sanitizedName.toLowerCase(),
      version: '1.0.0',
      description: component.description || `Generated React component: ${componentName}`,
      main: `${sanitizedName}.jsx`,
      dependencies: {
        react: '^18.2.0',
        'react-dom': '^18.2.0'
      },
      devDependencies: {
        '@types/react': '^18.2.0',
        '@types/react-dom': '^18.2.0'
      },
      scripts: {
        build: 'echo "Add your build script here"',
        start: 'echo "Add your start script here"'
      },
      keywords: ['react', 'component', 'generated'],
      author: `${req.user.firstName} ${req.user.lastName}`,
      license: 'MIT'
    };

    // Add files to archive
    archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' });
    archive.append(component.jsx, { name: `${sanitizedName}.jsx` });
    archive.append(component.css, { name: `${sanitizedName}.css` });

    // Generate README.md
    const readme = `# ${componentName}

${component.description || 'Generated React component'}

## Installation

\`\`\`bash
npm install
\`\`\`

## Usage

\`\`\`jsx
import ${sanitizedName} from './${sanitizedName}';
import './${sanitizedName}.css';

function App() {
  return (
    <div>
      <${sanitizedName} />
    </div>
  );
}
\`\`\`

## Props

${Object.keys(component.props || {}).length > 0 ? 
  Object.entries(component.props).map(([key, type]) => `- **${key}**: \`${type}\``).join('\n') :
  'No props defined'
}

## Generated Information

- **Generated on**: ${new Date(component.createdAt).toLocaleString()}
- **Component Version**: ${component.version}
- **Session**: ${session.name}

---

*This component was generated using the Component Generator Platform*
`;

    archive.append(readme, { name: 'README.md' });

    // Generate example usage file
    const exampleUsage = `import React from 'react';
import ${sanitizedName} from './${sanitizedName}';
import './${sanitizedName}.css';

export default function Example() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>Example Usage of ${componentName}</h1>
      <${sanitizedName} />
    </div>
  );
}`;

    archive.append(exampleUsage, { name: 'Example.jsx' });

    // Finalize archive
    archive.finalize();

  } catch (error) {
    console.error('Export component error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting component'
    });
  }
});

// @route   GET /api/export/code/:sessionId
// @desc    Get component code (JSX and CSS) as JSON
// @access  Private
router.get('/code/:sessionId', auth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    // Get session
    const session = await Session.findOne({ 
      _id: sessionId, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (!session.currentComponent) {
      return res.status(400).json({
        success: false,
        message: 'No component to export in this session'
      });
    }

    const component = session.currentComponent;

    res.json({
      success: true,
      data: {
        componentName: component.name,
        jsx: component.jsx,
        css: component.css,
        props: component.props,
        version: component.version,
        createdAt: component.createdAt,
        description: component.description
      }
    });

  } catch (error) {
    console.error('Get code error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting component code'
    });
  }
});

// @route   GET /api/export/history/:sessionId
// @desc    Export component history as ZIP
// @access  Private
router.get('/history/:sessionId', auth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;

    // Get session
    const session = await Session.findOne({ 
      _id: sessionId, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (!session.componentHistory || session.componentHistory.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No component history to export'
      });
    }

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${session.name}-history.zip"`);

    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Handle archive events
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({
        success: false,
        message: 'Error creating archive'
      });
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add current component if exists
    if (session.currentComponent) {
      const allComponents = [...session.componentHistory, session.currentComponent];
      
      allComponents.forEach((component, index) => {
        const componentName = component.name || `Component${index + 1}`;
        const sanitizedName = componentName.replace(/[^a-zA-Z0-9]/g, '');
        const versionSuffix = component.version ? `_v${component.version}` : '';
        
        archive.append(component.jsx, { 
          name: `${sanitizedName}${versionSuffix}/${sanitizedName}.jsx` 
        });
        archive.append(component.css, { 
          name: `${sanitizedName}${versionSuffix}/${sanitizedName}.css` 
        });
        
        // Add component info
        const componentInfo = {
          name: component.name,
          version: component.version,
          createdAt: component.createdAt,
          generatedBy: component.generatedBy,
          props: component.props
        };
        
        archive.append(JSON.stringify(componentInfo, null, 2), { 
          name: `${sanitizedName}${versionSuffix}/info.json` 
        });
      });
    }

    // Add session summary
    const sessionSummary = {
      sessionName: session.name,
      description: session.description,
      totalComponents: session.componentHistory.length + (session.currentComponent ? 1 : 0),
      createdAt: session.createdAt,
      lastAccessed: session.lastAccessed,
      metadata: session.metadata
    };

    archive.append(JSON.stringify(sessionSummary, null, 2), { name: 'session-summary.json' });

    // Finalize archive
    archive.finalize();

  } catch (error) {
    console.error('Export history error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error exporting component history'
    });
  }
});

// @route   POST /api/export/custom/:sessionId
// @desc    Export custom component bundle
// @access  Private
router.post('/custom/:sessionId', auth, async (req, res) => {
  try {
    const sessionId = req.params.sessionId;
    const { 
      includePackageJson = true, 
      includeReadme = true, 
      includeExample = true,
      includeTypes = false,
      format = 'jsx' // jsx or tsx
    } = req.body;

    // Get session
    const session = await Session.findOne({ 
      _id: sessionId, 
      userId: req.user._id 
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found'
      });
    }

    if (!session.currentComponent) {
      return res.status(400).json({
        success: false,
        message: 'No component to export in this session'
      });
    }

    const component = session.currentComponent;
    const componentName = component.name || 'Component';
    const sanitizedName = componentName.replace(/[^a-zA-Z0-9]/g, '');
    const fileExtension = format === 'tsx' ? 'tsx' : 'jsx';

    // Set response headers
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${sanitizedName}-custom.zip"`);

    // Create archive
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    // Handle archive events
    archive.on('error', (err) => {
      console.error('Archive error:', err);
      res.status(500).json({
        success: false,
        message: 'Error creating archive'
      });
    });

    // Pipe archive to response
    archive.pipe(res);

    // Add component files
    let jsxContent = component.jsx;
    
    // Convert to TypeScript if requested
    if (format === 'tsx' && includeTypes) {
      // Basic JSX to TSX conversion (you might want to enhance this)
      jsxContent = jsxContent.replace(/React\.FC/g, 'React.FC');
      if (!jsxContent.includes('React.FC')) {
        jsxContent = jsxContent.replace(
          /const\s+(\w+)\s*=\s*\(\s*{([^}]*)}\s*\)\s*=>/,
          `interface ${sanitizedName}Props {\n  $2\n}\n\nconst $1: React.FC<${sanitizedName}Props> = ({ $2 }) =>`
        );
      }
    }

    archive.append(jsxContent, { name: `${sanitizedName}.${fileExtension}` });
    archive.append(component.css, { name: `${sanitizedName}.css` });

    // Add optional files
    if (includePackageJson) {
      const packageJson = {
        name: sanitizedName.toLowerCase(),
        version: '1.0.0',
        description: component.description || `Generated React component: ${componentName}`,
        main: `${sanitizedName}.${fileExtension}`,
        dependencies: {
          react: '^18.2.0',
          'react-dom': '^18.2.0'
        },
        devDependencies: format === 'tsx' ? {
          '@types/react': '^18.2.0',
          '@types/react-dom': '^18.2.0',
          'typescript': '^5.0.0'
        } : {},
        keywords: ['react', 'component', 'generated'],
        author: `${req.user.firstName} ${req.user.lastName}`,
        license: 'MIT'
      };

      archive.append(JSON.stringify(packageJson, null, 2), { name: 'package.json' });
    }

    if (includeReadme) {
      const readme = `# ${componentName}

${component.description || 'Generated React component'}

## Props

${Object.keys(component.props || {}).length > 0 ? 
  Object.entries(component.props).map(([key, type]) => `- **${key}**: \`${type}\``).join('\n') :
  'No props defined'
}

## Generated Information

- **Generated on**: ${new Date(component.createdAt).toLocaleString()}
- **Component Version**: ${component.version}
- **Format**: ${format.toUpperCase()}
`;

      archive.append(readme, { name: 'README.md' });
    }

    if (includeExample) {
      const exampleContent = `import React from 'react';
import ${sanitizedName} from './${sanitizedName}';
import './${sanitizedName}.css';

export default function Example() {
  return (
    <div>
      <${sanitizedName} />
    </div>
  );
}`;

      archive.append(exampleContent, { name: `Example.${fileExtension}` });
    }

    // Finalize archive
    archive.finalize();

  } catch (error) {
    console.error('Custom export error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error creating custom export'
    });
  }
});

module.exports = router;