// src/services/pdf-service.ts
import { TicketData } from "../types/booking";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { format } from "date-fns";

export const pdfService = {
  async generateTicketPDF(ticket: TicketData): Promise<Uint8Array> {
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();

    // Add a blank page
    const page = pdfDoc.addPage([600, 800]);

    // Get the standard font
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // Set page margins
    const margin = 50;
    const width = page.getWidth() - 2 * margin;

    // Draw title
    page.drawText(`${ticket.airline} - E-Ticket`, {
      x: margin,
      y: 750,
      size: 24,
      font: boldFont,
    });

    // Draw horizontal line
    page.drawLine({
      start: { x: margin, y: 740 },
      end: { x: margin + width, y: 740 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Draw flight info
    page.drawText("Flight Information", {
      x: margin,
      y: 710,
      size: 16,
      font: boldFont,
    });

    page.drawText(`Flight: ${ticket.airline} ${ticket.flightNumber}`, {
      x: margin,
      y: 680,
      size: 12,
      font: font,
    });

    page.drawText(
      `Date: ${format(new Date(ticket.departureTime), "EEEE, MMMM d, yyyy")}`,
      {
        x: margin,
        y: 660,
        size: 12,
        font: font,
      }
    );

    // Draw departure and arrival info
    page.drawText("From", {
      x: margin,
      y: 630,
      size: 14,
      font: boldFont,
    });

    page.drawText(`${ticket.departureCity} (${ticket.departureCode})`, {
      x: margin,
      y: 610,
      size: 12,
      font: font,
    });

    page.drawText(`${ticket.departureAirport}`, {
      x: margin,
      y: 590,
      size: 12,
      font: font,
    });

    page.drawText(
      `Departure: ${format(new Date(ticket.departureTime), "h:mm a")}`,
      {
        x: margin,
        y: 570,
        size: 12,
        font: font,
      }
    );

    page.drawText("To", {
      x: margin + 300,
      y: 630,
      size: 14,
      font: boldFont,
    });

    page.drawText(`${ticket.arrivalCity} (${ticket.arrivalCode})`, {
      x: margin + 300,
      y: 610,
      size: 12,
      font: font,
    });

    page.drawText(`${ticket.arrivalAirport}`, {
      x: margin + 300,
      y: 590,
      size: 12,
      font: font,
    });

    page.drawText(
      `Arrival: ${format(new Date(ticket.arrivalTime), "h:mm a")}`,
      {
        x: margin + 300,
        y: 570,
        size: 12,
        font: font,
      }
    );

    // Draw horizontal line
    page.drawLine({
      start: { x: margin, y: 550 },
      end: { x: margin + width, y: 550 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Draw booking info
    page.drawText("Booking Information", {
      x: margin,
      y: 520,
      size: 16,
      font: boldFont,
    });

    page.drawText(`PNR: ${ticket.pnr}`, {
      x: margin,
      y: 490,
      size: 12,
      font: font,
    });

    page.drawText(
      `Booking Date: ${format(
        new Date(ticket.bookingDate),
        "MMMM d, yyyy h:mm a"
      )}`,
      {
        x: margin,
        y: 470,
        size: 12,
        font: font,
      }
    );

    page.drawText(`Total Amount: ₹${ticket.totalAmount.toFixed(2)}`, {
      x: margin,
      y: 450,
      size: 12,
      font: font,
    });

    // Draw horizontal line
    page.drawLine({
      start: { x: margin, y: 430 },
      end: { x: margin + width, y: 430 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Draw passenger info
    page.drawText("Passenger Information", {
      x: margin,
      y: 400,
      size: 16,
      font: boldFont,
    });

    // Table header
    page.drawText("Name", {
      x: margin,
      y: 370,
      size: 12,
      font: boldFont,
    });

    page.drawText("Age", {
      x: margin + 200,
      y: 370,
      size: 12,
      font: boldFont,
    });

    page.drawText("Gender", {
      x: margin + 250,
      y: 370,
      size: 12,
      font: boldFont,
    });

    page.drawText("Seat", {
      x: margin + 350,
      y: 370,
      size: 12,
      font: boldFont,
    });

    // Draw line under header
    page.drawLine({
      start: { x: margin, y: 360 },
      end: { x: margin + width, y: 360 },
      thickness: 1,
      color: rgb(0.7, 0.7, 0.7),
    });

    // Passenger rows
    let y = 340;
    ticket.passengers.forEach((passenger, index) => {
      page.drawText(passenger.name, {
        x: margin,
        y,
        size: 10,
        font: font,
      });

      page.drawText(passenger.age.toString(), {
        x: margin + 200,
        y,
        size: 10,
        font: font,
      });

      page.drawText(passenger.gender, {
        x: margin + 250,
        y,
        size: 10,
        font: font,
      });

      page.drawText(passenger.seat, {
        x: margin + 350,
        y,
        size: 10,
        font: font,
      });

      y -= 20;
    });

    // Draw footer
    page.drawText(
      `Thank you for choosing ${ticket.airline}. We wish you a pleasant journey!`,
      {
        x: margin,
        y: 100,
        size: 10,
        font: font,
      }
    );

    // Serialize the PDF to bytes
    const pdfBytes = await pdfDoc.save();

    return pdfBytes;
  },
};
