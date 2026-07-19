import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import stream from "stream";
export const generateLabReportPDF = async (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const doc = new PDFDocument({ margin: 50 });
            const buffers = [];
            const passThrough = new stream.PassThrough();
            doc.pipe(passThrough);
            passThrough.on("data", (chunk) => buffers.push(chunk));
            passThrough.on("end", () => resolve(Buffer.concat(buffers)));
            passThrough.on("error", (err) => reject(err));
            // Header
            doc.fontSize(24).font("Helvetica-Bold").text(data.labName, { align: "center" });
            if (data.labCertificate) {
                doc.fontSize(10).font("Helvetica").text(`NABL / Cert: ${data.labCertificate}`, { align: "center" });
            }
            doc.moveDown(2);
            // Patient Info Section
            doc.fontSize(12).font("Helvetica-Bold").text("Patient Information");
            doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
            doc.moveDown(0.5);
            doc.font("Helvetica").fontSize(10);
            doc.text(`Name: ${data.patientName}`, 50, doc.y);
            doc.text(`Age/Gender: ${data.patientAge} / ${data.patientGender}`, 300, doc.y - 12);
            doc.text(`Referred By: ${data.doctorName || "Self"}`, 50, doc.y + 5);
            doc.text(`Date: ${data.date.toLocaleDateString()}`, 300, doc.y - 12);
            doc.moveDown(2);
            // Test Name
            doc.fontSize(16).font("Helvetica-Bold").text(data.testName, { align: "center" });
            doc.moveDown(1);
            // Results Table Header
            const tableTop = doc.y;
            doc.fontSize(10).font("Helvetica-Bold");
            doc.text("Parameter", 50, tableTop);
            doc.text("Result", 250, tableTop);
            doc.text("Unit", 350, tableTop);
            doc.text("Reference Range", 430, tableTop);
            doc.moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();
            let currentY = tableTop + 25;
            doc.font("Helvetica");
            data.results.forEach((row) => {
                // Flag high/low in red (optional enhancement)
                if (row.flag === "High" || row.flag === "Low")
                    doc.fillColor("red");
                else
                    doc.fillColor("black");
                doc.text(row.parameter, 50, currentY);
                doc.text(`${row.result} ${row.flag ? (row.flag === "High" ? "(H)" : "(L)") : ""}`, 250, currentY);
                doc.fillColor("black"); // reset for others
                doc.text(row.unit, 350, currentY);
                doc.text(row.referenceRange, 430, currentY);
                currentY += 20;
            });
            doc.moveDown(2);
            if (data.comments) {
                doc.font("Helvetica-Bold").text("Comments/Notes:");
                doc.font("Helvetica").text(data.comments);
                doc.moveDown(2);
            }
            // Footer & QR Code
            const qrY = doc.page.height - 150;
            doc.fontSize(10).text("Scan to Verify Report Authenticity:", 50, qrY);
            // Generate QR mapping to a future public verify route
            const verifyUrl = `https://your-domain.com/verify/report/${data.verificationId}`;
            const qrDataUrl = await QRCode.toDataURL(verifyUrl);
            const qrBuffer = Buffer.from(qrDataUrl.split(',')[1], 'base64');
            doc.image(qrBuffer, 50, qrY + 15, { width: 80 });
            doc.font("Helvetica-Oblique").text("Electronically Generated & Signed", 400, qrY + 40);
            doc.end();
        }
        catch (error) {
            reject(error);
        }
    });
};
