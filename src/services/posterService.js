// Poster generation service using local templates and html2canvas
// Replaces Firebase Storage with local template files

export class PosterService {
  constructor() {
    this.templatePath = '/templates';
    this.availableTemplates = [
      {
        id: 'template1',
        name: 'Modern Gradient',
        preview: '/templates/template1-preview.jpg',
        file: '/templates/template1.html',
        description: 'Modern gradient background with clean typography'
      },
      {
        id: 'template2',
        name: 'Festival Celebration',
        preview: '/templates/template2-preview.jpg',
        file: '/templates/template2.html',
        description: 'Colorful celebration theme with confetti elements'
      },
      {
        id: 'template3',
        name: 'Academic Excellence',
        preview: '/templates/template3-preview.jpg',
        file: '/templates/template3.html',
        description: 'Professional academic theme with gold accents'
      },
      {
        id: 'template4',
        name: 'Creative Arts',
        preview: '/templates/template4-preview.jpg',
        file: '/templates/template4.html',
        description: 'Artistic theme with paint splash effects'
      },
      {
        id: 'template5',
        name: 'Tech Innovation',
        preview: '/templates/template5-preview.jpg',
        file: '/templates/template5.html',
        description: 'Futuristic tech theme with circuit patterns'
      }
    ];
  }

  // Get all available templates
  getTemplates() {
    return this.availableTemplates;
  }

  // Get template by ID
  getTemplate(templateId) {
    return this.availableTemplates.find(template => template.id === templateId);
  }

  // Generate poster data structure
  createPosterData(competitionData, results, templateId = 'template1') {
    const template = this.getTemplate(templateId);
    
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    return {
      id: `poster_${Date.now()}`,
      templateId,
      templateName: template.name,
      competition: {
        name: competitionData.name,
        date: competitionData.date,
        venue: competitionData.venue,
        category: competitionData.category
      },
      results: results.map((result, index) => ({
        position: index + 1,
        positionText: this.getPositionText(index + 1),
        studentName: result.studentName,
        studentCode: result.studentCode,
        team: result.team,
        points: result.points || 0
      })),
      festival: {
        name: 'RENDEZVOUS 2025',
        venue: 'MARKAZ MIHRAJ MALAYIL',
        logo: '🎭'
      },
      createdAt: new Date().toISOString(),
      createdBy: 'admin'
    };
  }

  // Get position text (1st, 2nd, 3rd, etc.)
  getPositionText(position) {
    const suffixes = ['th', 'st', 'nd', 'rd'];
    const remainder = position % 100;
    
    if (remainder >= 11 && remainder <= 13) {
      return `${position}th`;
    }
    
    const suffix = suffixes[position % 10] || suffixes[0];
    return `${position}${suffix}`;
  }

  // Generate poster HTML content
  generatePosterHTML(posterData) {
    const { competition, results, festival, templateId } = posterData;
    
    // Base HTML template that can be customized per template
    const baseHTML = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${competition.name} - Results</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          .poster {
            width: 800px;
            height: 1200px;
            position: relative;
            font-family: 'Arial', sans-serif;
            overflow: hidden;
            ${this.getTemplateStyles(templateId)}
          }
          
          .header {
            text-align: center;
            padding: 40px 20px;
            position: relative;
            z-index: 2;
          }
          
          .festival-logo {
            font-size: 60px;
            margin-bottom: 20px;
          }
          
          .festival-name {
            font-size: 36px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #ffffff;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
          }
          
          .festival-venue {
            font-size: 18px;
            color: #ffffff;
            opacity: 0.9;
            margin-bottom: 30px;
          }
          
          .competition-title {
            font-size: 32px;
            font-weight: bold;
            color: #ffffff;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
            margin-bottom: 10px;
          }
          
          .competition-details {
            font-size: 16px;
            color: #ffffff;
            opacity: 0.9;
          }
          
          .results-section {
            padding: 40px;
            position: relative;
            z-index: 2;
          }
          
          .results-title {
            font-size: 28px;
            font-weight: bold;
            text-align: center;
            margin-bottom: 30px;
            color: #ffffff;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
          }
          
          .result-item {
            background: rgba(255, 255, 255, 0.95);
            margin-bottom: 20px;
            padding: 25px;
            border-radius: 15px;
            box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            display: flex;
            align-items: center;
            justify-content: space-between;
          }
          
          .position {
            font-size: 48px;
            font-weight: bold;
            width: 80px;
            text-align: center;
          }
          
          .position.first { color: #FFD700; }
          .position.second { color: #C0C0C0; }
          .position.third { color: #CD7F32; }
          .position.other { color: #666; }
          
          .student-info {
            flex: 1;
            margin-left: 20px;
          }
          
          .student-name {
            font-size: 24px;
            font-weight: bold;
            color: #333;
            margin-bottom: 5px;
          }
          
          .student-details {
            font-size: 16px;
            color: #666;
          }
          
          .points {
            font-size: 20px;
            font-weight: bold;
            color: #4CAF50;
          }
          
          .footer {
            position: absolute;
            bottom: 30px;
            left: 0;
            right: 0;
            text-align: center;
            color: #ffffff;
            opacity: 0.8;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="poster" id="poster">
          <div class="header">
            <div class="festival-logo">${festival.logo}</div>
            <div class="festival-name">${festival.name}</div>
            <div class="festival-venue">${festival.venue}</div>
            <div class="competition-title">${competition.name}</div>
            <div class="competition-details">
              ${competition.date} • ${competition.venue} • ${competition.category}
            </div>
          </div>
          
          <div class="results-section">
            <div class="results-title">🏆 RESULTS</div>
            ${results.map((result, index) => `
              <div class="result-item">
                <div class="position ${this.getPositionClass(index + 1)}">${result.positionText}</div>
                <div class="student-info">
                  <div class="student-name">${result.studentName}</div>
                  <div class="student-details">${result.studentCode} • ${result.team}</div>
                </div>
                <div class="points">${result.points} pts</div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            Generated on ${new Date().toLocaleDateString()} • Campus Festival Management System
          </div>
        </div>
      </body>
      </html>
    `;
    
    return baseHTML;
  }

  // Get template-specific styles
  getTemplateStyles(templateId) {
    const styles = {
      template1: `
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      `,
      template2: `
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="20" cy="20" r="2" fill="rgba(255,255,255,0.3)"/><circle cx="80" cy="30" r="1.5" fill="rgba(255,255,255,0.2)"/><circle cx="40" cy="70" r="1" fill="rgba(255,255,255,0.4)"/></svg>');
          opacity: 0.3;
        }
      `,
      template3: `
        background: linear-gradient(135deg, #2c3e50 0%, #34495e 100%);
        color: white;
        border: 10px solid #f39c12;
      `,
      template4: `
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
        color: #333;
      `,
      template5: `
        background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
        color: #00d4ff;
        &::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image: repeating-linear-gradient(
            90deg,
            transparent,
            transparent 98px,
            rgba(0, 212, 255, 0.1) 100px
          );
        }
      `
    };
    
    return styles[templateId] || styles.template1;
  }

  // Get position class for styling
  getPositionClass(position) {
    switch (position) {
      case 1: return 'first';
      case 2: return 'second';
      case 3: return 'third';
      default: return 'other';
    }
  }

  // Generate and download poster
  async generatePoster(posterData, format = 'png') {
    try {
      console.log('🎨 Generating poster...', posterData.competition.name);
      
      // Create temporary iframe to render HTML
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '800px';
      iframe.style.height = '1200px';
      
      document.body.appendChild(iframe);
      
      // Generate HTML content
      const htmlContent = this.generatePosterHTML(posterData);
      
      // Write HTML to iframe
      iframe.contentDocument.open();
      iframe.contentDocument.write(htmlContent);
      iframe.contentDocument.close();
      
      // Wait for content to load
      await new Promise(resolve => {
        iframe.onload = resolve;
        setTimeout(resolve, 1000); // Fallback timeout
      });
      
      // Import html2canvas dynamically
      const html2canvas = (await import('html2canvas')).default;
      
      // Generate canvas from iframe content
      const canvas = await html2canvas(iframe.contentDocument.body, {
        width: 800,
        height: 1200,
        scale: 2, // Higher resolution
        backgroundColor: null,
        logging: false
      });
      
      // Clean up iframe
      document.body.removeChild(iframe);
      
      // Convert to blob and download
      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${posterData.competition.name}_Results.${format}`;
          
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          
          URL.revokeObjectURL(url);
          
          console.log('✅ Poster downloaded successfully');
          resolve({
            success: true,
            fileName: link.download,
            blob: blob
          });
        }, `image/${format}`, 0.9);
      });
      
    } catch (error) {
      console.error('❌ Error generating poster:', error);
      throw error;
    }
  }

  // Generate poster preview (smaller version)
  async generatePreview(posterData) {
    try {
      const iframe = document.createElement('iframe');
      iframe.style.position = 'absolute';
      iframe.style.left = '-9999px';
      iframe.style.width = '400px';
      iframe.style.height = '600px';
      
      document.body.appendChild(iframe);
      
      const htmlContent = this.generatePosterHTML(posterData);
      
      iframe.contentDocument.open();
      iframe.contentDocument.write(htmlContent);
      iframe.contentDocument.close();
      
      await new Promise(resolve => {
        iframe.onload = resolve;
        setTimeout(resolve, 500);
      });
      
      const html2canvas = (await import('html2canvas')).default;
      
      const canvas = await html2canvas(iframe.contentDocument.body, {
        width: 400,
        height: 600,
        scale: 1,
        backgroundColor: null,
        logging: false
      });
      
      document.body.removeChild(iframe);
      
      return canvas.toDataURL('image/png', 0.8);
    } catch (error) {
      console.error('❌ Error generating preview:', error);
      throw error;
    }
  }
}

// Create singleton instance
const posterService = new PosterService();

export default posterService;
