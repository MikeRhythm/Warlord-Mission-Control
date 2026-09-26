import fs from 'fs';
import path from 'path';

// Path to Master Tool Registry
const REGISTRY_PATH = 'C:\\Warlord_Inc\\Warlord_WASP\\MCNC\\tools\\master_tool_registry.json';

export async function handleMontyDispatch(req, res) {
  const { project, timestamp } = req.body;

  try {
    // 1. Read validated PRD from storage
    const prdPath = path.join('C:\\Warlord_Inc\\MCNC\\vault\\PRD', `${project.replace(/[^a-zA-Z0-9_-]/g, '_')}_PRD.md`);
    let prdContent = '';
    
    if (fs.existsSync(prdPath)) {
      prdContent = fs.readFileSync(prdPath, 'utf-8');
    }

    // 2. Load the Master Tool Registry
    let registry = { tools: {} };
    if (fs.existsSync(REGISTRY_PATH)) {
      registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'));
    }

    // 3. Extract Dispatch Manifest Tasks
    const manifestMatch = prdContent.match(/### DISPATCH MANIFEST([\s\S]*?)(?:$|###)/);
    const generatedTasks = [];

    if (manifestMatch) {
      const lines = manifestMatch[1].split('\n').filter(l => l.trim().startsWith('- Task:'));
      
      lines.forEach((line, idx) => {
        // Parse line: - Task: "Title" | Director: Agent | Tool: tool_id | Status: APPROVED
        const taskName = line.match(/Task:\s*"?([^"|]+)"?/i)?.[1]?.trim() || `Execution Unit ${idx + 1}`;
        const director = line.match(/Director:\s*([^|]+)/i)?.[1]?.trim() || 'CHARLIE // CODE';
        const toolId = line.match(/Tool:\s*([^|]+)/i)?.[1]?.trim() || 'github_deploy';

        const toolConfig = registry.tools[toolId] || {
          command: 'npx -y @modelcontextprotocol/server-filesystem',
          description: 'Default fallback runner'
        };

        generatedTasks.push({
          id: `TASK-${Date.now()}-${idx}`,
          project: project,
          title: taskName,
          assignedDirector: director,
          toolId: toolId,
          toolCommand: toolConfig.command,
          status: 'READY_FOR_PAPERCLIP',
          createdAt: new Date().toISOString()
        });
      });
    }

    // 4. Commit tasks to Paperclip pipeline
    const taskBoardPath = path.join('C:\\Warlord_Inc\\MCNC\\vault\\tasks', `${project}_tasks.json`);
    fs.mkdirSync(path.dirname(taskBoardPath), { recursive: true });
    fs.writeFileSync(taskBoardPath, JSON.stringify(generatedTasks, null, 2));

    return res.json({ 
      success: true, 
      dispatchedCount: generatedTasks.length, 
      tasks: generatedTasks 
    });

  } catch (error) {
    console.error('[DISPATCH ERROR]:', error);
    return res.status(500).json({ error: error.message });
  }
}