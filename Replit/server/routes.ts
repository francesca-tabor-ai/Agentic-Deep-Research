import type { Express } from "express";
import { type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { openai } from "./replit_integrations/audio/client"; // reusing configured client

// Mock User ID for MVP
const MOCK_USER_ID = "00000000-0000-0000-0000-000000000001";

async function seedDatabase() {
  let user = await storage.getUserByUsername("researcher_alpha");
  if (!user) {
    user = await storage.createUser({
      username: "researcher_alpha",
      password: "password123", // In a real app, hash this
    });
    // For simplicity of MVP routing, override the generated ID if possible
    // but Drizzle auto-generates it. Let's just use the real generated ID for our mock.
    // Actually, to make things simple, we'll just grab the first user in routes.
  }

  const existingDocs = await storage.getDocuments();
  let doc1Id = "";
  let doc2Id = "";

  if (existingDocs.length === 0) {
    const doc1 = await storage.createDocument({
      title: "Attention Is All You Need",
      authors: ["Ashish Vaswani", "Noam Shazeer", "Niki Parmar", "Jakob Uszkoreit", "Llion Jones", "Aidan N. Gomez", "Lukasz Kaiser", "Illia Polosukhin"],
      abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...",
      url: "https://arxiv.org/abs/1706.03762",
      doi: "10.48550/arXiv.1706.03762",
      publishedAt: new Date("2017-06-12"),
    });
    doc1Id = doc1.id;

    const doc2 = await storage.createDocument({
      title: "AlphaFold: Highly accurate protein structure prediction",
      authors: ["John Jumper", "Richard Evans", "Alexander Pritzel", "Tim Green", "Michael Figurnov", "Olaf Ronneberger", "Kathryn Tunyasuvunakool", "Russ Bates", "Augustin Žídek", "Anna Potapenko", "Alex Bridgland", "Clemens Meyer", "Simon A A Kohl", "Andrew J Ballard", "Andrew Cowie", "Bernardino Romera-Paredes", "Stanislav Nikolov", "Rishub Jain", "Jonas Adler", "Trevor Back", "Stig Petersen", "David Reiman", "Ellen Clancy", "Michal Zielinski", "Martin Steinegger", "Michalina Pacholska", "Tam Berghammer", "Sebastian Bodenstein", "David Silver", "Oriol Vinyals", "Andrew W Senior", "Koray Kavukcuoglu", "Pushmeet Kohli", "Demis Hassabis"],
      abstract: "Proteins are essential to life, and understanding their structure can facilitate a mechanistic understanding of their function...",
      url: "https://www.nature.com/articles/s41586-021-03819-2",
      doi: "10.1038/s41586-021-03819-2",
      publishedAt: new Date("2021-07-15"),
    });
    doc2Id = doc2.id;
  } else {
    doc1Id = existingDocs[0].id;
    if (existingDocs.length > 1) {
       doc2Id = existingDocs[1].id;
    } else {
       doc2Id = existingDocs[0].id;
    }
  }

  const tasks = await storage.getTasks(user.id);
  if (tasks.length === 0) {
    const task1 = await storage.createTask({
      userId: user.id,
      query: "Review recent advances in protein folding using transformer architectures",
      status: "completed",
      result: "# Summary\n\nRecent advances have heavily relied on transformer architectures, originally developed for NLP, to achieve unprecedented accuracy in protein structure prediction.\n\n## Key Findings\n- **AlphaFold 2** utilizes a novel transformer-based architecture called Evoformer to process spatial graphs.\n- Transformers effectively capture long-range interactions in amino acid sequences.\n\n## Research Gaps\n- Computational cost remains high for very large protein complexes.\n- Predicting dynamics and multiple conformational states is still challenging.",
    });

    await storage.createCitation({
      taskId: task1.id,
      documentId: doc1Id,
      relevanceScore: "0.8",
      snippet: "Self-attention mechanisms...",
    });

    await storage.createCitation({
      taskId: task1.id,
      documentId: doc2Id,
      relevanceScore: "0.99",
      snippet: "We developed a neural network architecture, AlphaFold, that is able to predict protein structures with atomic accuracy...",
    });

    await storage.createTask({
        userId: user.id,
        query: "Investigate novel drug delivery mechanisms using nanoparticles",
        status: "pending"
    });
  }
}

// Background worker for simulating Deep Research
async function processTaskBackground(taskId: string, query: string, userId: string) {
    try {
        await storage.updateTaskStatus(taskId, "planning");
        await new Promise(resolve => setTimeout(resolve, 2000));

        await storage.updateTaskStatus(taskId, "searching");
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Let's use the LLM to actually synthesize a small response based on the vault
        await storage.updateTaskStatus(taskId, "synthesizing");
        
        const docs = await storage.getDocuments();
        
        const prompt = `
        You are a Deep Research Agent. 
        User Query: ${query}
        
        Available Vault Documents:
        ${docs.map(d => `- [${d.id}] ${d.title} by ${d.authors.join(", ")}: ${d.abstract}`).join("\n")}
        
        Write a short structured research report (markdown). Cite the document IDs if relevant.
        Format:
        # Summary
        ...
        ## Key Findings
        ...
        ## Research Gaps
        ...
        `;

        const response = await openai.chat.completions.create({
            model: "gpt-5.1",
            messages: [{ role: "user", content: prompt }]
        });

        const resultText = response.choices[0]?.message?.content || "Synthesis completed.";

        await storage.updateTaskStatus(taskId, "completed", resultText);
        
        // If the LLM cited anything, we'd ideally parse it, but for MVP let's just cite a random doc
        if (docs.length > 0) {
            await storage.createCitation({
                taskId,
                documentId: docs[0].id,
                relevanceScore: "0.85",
                snippet: "Agent autonomously selected this document as highly relevant.",
            });
        }


    } catch (e) {
        console.error("Task failed:", e);
        await storage.updateTaskStatus(taskId, "failed", String(e));
    }
}


export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Seed the DB before starting handling requests
  seedDatabase().catch(console.error);

  // Helper to get the mock user
  async function getMockUser() {
     let user = await storage.getUserByUsername("researcher_alpha");
     if (!user) {
        throw new Error("Seed failed, user not found");
     }
     return user;
  }

  // Tasks
  app.get(api.tasks.list.path, async (req, res) => {
    try {
      const user = await getMockUser();
      const tasks = await storage.getTasks(user.id);
      res.json(tasks);
    } catch (e) {
      res.status(500).json({ message: "Internal error" });
    }
  });

  app.get(api.tasks.get.path, async (req, res) => {
    const task = await storage.getTask(req.params.id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    // Simple auth check
    const user = await getMockUser();
    if (task.userId !== user.id) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    
    res.json(task);
  });

  app.post(api.tasks.create.path, async (req, res) => {
    try {
      const input = api.tasks.create.input.parse(req.body);
      const user = await getMockUser();
      
      const task = await storage.createTask({
        userId: user.id,
        query: input.query,
        status: "pending"
      });

      // Kick off background job
      processTaskBackground(task.id, task.query, user.id);

      res.status(201).json({ taskId: task.id, status: task.status });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Documents
  app.get(api.documents.list.path, async (req, res) => {
     try {
         // Optionally parse search query from req.query
         const docs = await storage.getDocuments();
         res.json(docs);
     } catch (e) {
         res.status(500).json({ message: "Internal error" });
     }
  });


  return httpServer;
}
