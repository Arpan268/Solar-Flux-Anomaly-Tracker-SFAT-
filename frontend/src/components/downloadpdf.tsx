import { marked } from 'marked';

interface DownloadPdfProps {
    title: string;
    content: string;
}

export default function DownloadPdf({ title, content }: DownloadPdfProps) {
    const handleDownload = async () => {
        const htmlContent = await marked.parse(content);

        const printWindow = window.open('', '_blank');

        if (printWindow) {
            printWindow.document.write(`
                <!DOCTYPE html>
                <html>
                    <head>
                        <title>${title}</title>
                        <style>
                            body { 
                                font-family: system-ui, -apple-system, sans-serif; 
                                line-height: 1.6; 
                                padding: 40px; 
                                color: #111; 
                                max-width: 800px; 
                                margin: auto; 
                            }
                            /* Subtle Project Header */
                            .project-header { 
                                font-size: 12px; 
                                color: #6b7280; 
                                text-transform: uppercase; 
                                letter-spacing: 1.5px; 
                                border-bottom: 2px solid #e5e7eb; 
                                padding-bottom: 8px; 
                                margin-bottom: 24px; 
                                font-weight: 600;
                            }
                            /* Main Report Title */
                            h1.report-title { 
                                color: #1e3a8a; 
                                font-size: 24px;
                                margin-top: 0; 
                                margin-bottom: 24px;
                            }
                            /* Formatted Markdown Elements */
                            .report-content h2 { 
                                color: #374151; 
                                margin-top: 32px; 
                                font-size: 18px; 
                                border-bottom: 1px solid #f3f4f6; 
                                padding-bottom: 6px; 
                            }
                            .report-content p { margin-bottom: 16px; }
                            .report-content ul { padding-left: 24px; margin-bottom: 16px; }
                            .report-content li { margin-bottom: 8px; }
                            .report-content strong { color: #000; }
                            
                            /* Clean up padding for the actual print layout */
                            @media print {
                                body { padding: 0; }
                            }
                        </style>
                    </head>
                    <body>
                        <div class="project-header">Solar Flux Anomaly Tracker</div>
                        <h1 class="report-title">${title}</h1>
                        <div class="report-content">
                            ${htmlContent}
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();

            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        } else {
            alert("Please allow pop-ups for this site to download the PDF report.");
        }
    };

    return (
        <button
            onClick={handleDownload}
            className="bg-blue-600 hover:bg-blue-700 cursor-pointer text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-blue-900/20 transition-colors"
        >
            Download PDF Report
        </button>
    );
}