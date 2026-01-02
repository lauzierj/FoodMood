# Documentation Requirements

When implementing changes to the codebase:

1. **Create documentation folder structure**:

   - Store all documentation in a `docs/` folder at the repository root
   - Create a subfolder named after your branch (e.g., `docs/ai-feature-branch/`)
   - Store all evidence and documentation for that branch in this folder

2. **Required documentation**:

   - **Screenshots**: Take screenshots of the application showing your changes in action
     - Build and launch the application
     - Navigate through the browser to test features
     - Capture screenshots of affected pages and features
   - **Architecture diagrams**: Document any architectural changes or new components
   - **Implementation reasoning**: Explain why specific approaches were chosen
   - **Test evidence**: Include screenshots or logs showing tests passing

3. **Screenshot requirements**:

   - Take screenshots of the homepage/main view
   - Capture individual feature pages affected by changes
   - Include both before and after states when modifying existing features
   - Show responsive views for UI changes
   - Name screenshots descriptively (e.g., `homepage.png`, `feature-detail-view.png`)

4. **Documentation format**:
   - Create a `README.md` in the branch folder explaining:
     - What was changed
     - Why the changes were made
     - How to test the changes
     - Links to relevant screenshots
   - Use relative links to reference screenshots and other documentation

# Testing and Validation Requirements

When implementing any functionality changes:

1. **Build and Test Process**:

   - Always build the project using the appropriate build command
   - Launch the application locally to verify functionality
   - Navigate through the browser to test affected features
   - Take screenshots showing the changes in action

2. **MCP Configuration**:

   - Use the `.cursor/mcp.json` file for Model Context Protocol configuration
   - Cursor Cloud Agents automatically detect and use MCP servers configured in this file
   - Includes Playwright MCP server for browser automation and testing

3. **Documentation Evidence**:
   - Screenshots must be uploaded to pull requests showing functionality
   - Include both before/after states when modifying existing features
   - Test evidence should demonstrate successful implementation
