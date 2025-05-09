// backend/src/services/pdf-service.ts - Made more consistent
import { IBooking } from "../models/booking-model";
import { IFlight } from "../models/flight-model";

export class PDFService {
  /**
   * Generate HTML for the flight ticket
   */
  static generateTicketHTML(booking: IBooking, flight: IFlight): string {
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Generate passenger rows
    let passengerRows = "";
    booking.passengers.forEach((passenger, index) => {
      passengerRows += `
        <tr>
          <td>${passenger.name}</td>
          <td>${passenger.age}</td>
          <td>${passenger.gender}</td>
          <td>${booking.seatNumbers[index] || "Not assigned"}</td>
        </tr>
      `;
    });

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Flight Ticket</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .ticket {
            width: 800px;
            margin: 20px auto;
            border: 1px solid #ccc;
            border-radius: 8px;
            overflow: hidden;
          }
          .header {
            background-color: #0047AB;
            color: white;
            padding: 15px;
            text-align: center;
          }
          .airline-logo {
            height: 40px;
            margin-right: 10px;
          }
          .flight-info {
            display: flex;
            padding: 20px;
            justify-content: space-between;
            background-color: #f9f9f9;
          }
          .departure, .arrival {
            width: 45%;
          }
          .flight-path {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 10%;
          }
          .city {
            font-size: 24px;
            font-weight: bold;
          }
          .airport {
            color: #666;
            margin-bottom: 10px;
          }
          .time {
            font-size: 20px;
            font-weight: bold;
          }
          .date {
            color: #666;
          }
          .details {
            padding: 20px;
            border-top: 1px dashed #ccc;
            border-bottom: 1px dashed #ccc;
          }
          .details-row {
            display: flex;
            margin-bottom: 15px;
          }
          .details-label {
            width: 140px;
            font-weight: bold;
          }
          .passenger-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          .passenger-table th, .passenger-table td {
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #eee;
          }
          .passenger-table th {
            background-color: #f2f2f2;
          }
          .barcode {
            text-align: center;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .barcode img {
            height: 60px;
          }
          .footer {
            padding: 15px;
            text-align: center;
            background-color: #0047AB;
            color: white;
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>${flight.airline} - E-Ticket</h1>
          </div>
          
          <div class="flight-info">
            <div class="departure">
              <div class="city">${flight.departureCity}</div>
              <div class="airport">${flight.departureAirport} (${
      flight.departureCode
    })</div>
              <div class="time">${formatDate(flight.departureTime)}</div>
            </div>
            
            <div class="flight-path">
              <div>✈️</div>
            </div>
            
            <div class="arrival">
              <div class="city">${flight.arrivalCity}</div>
              <div class="airport">${flight.arrivalAirport} (${
      flight.arrivalCode
    })</div>
              <div class="time">${formatDate(flight.arrivalTime)}</div>
            </div>
          </div>
          
          <div class="details">
            <div class="details-row">
              <div class="details-label">Booking Reference:</div>
              <div>${booking.pnr}</div>
            </div>
            
            <div class="details-row">
              <div class="details-label">Flight Number:</div>
              <div>${flight.flightNumber}</div>
            </div>
            
            <div class="details-row">
              <div class="details-label">Aircraft:</div>
              <div>${flight.aircraft}</div>
            </div>
            
            <div class="details-row">
              <div class="details-label">Duration:</div>
              <div>${Math.floor(flight.duration / 60)}h ${
      flight.duration % 60
    }m</div>
            </div>
            
            <div class="details-row">
              <div class="details-label">Booking Date:</div>
              <div>${new Date(booking.bookingDate).toLocaleString(
                "en-IN"
              )}</div>
            </div>
            
            <div class="details-row">
              <div class="details-label">Total Amount:</div>
              <div>₹${booking.totalAmount.toFixed(2)}</div>
            </div>
            
            <table class="passenger-table">
              <thead>
                <tr>
                  <th>Passenger Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Seat</th>
                </tr>
              </thead>
              <tbody>
                ${passengerRows}
              </tbody>
            </table>
          </div>
          
          <div class="barcode">
            <div style="font-family: monospace; font-size: 18px; letter-spacing: 5px; margin-bottom: 10px;">
              ${booking.pnr}
            </div>
          </div>
          
          <div class="footer">
            <p>Thank you for choosing ${
              flight.airline
            }. We wish you a pleasant journey!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate ticket data for frontend rendering
   */
  static generateTicketData(booking: IBooking, flight: IFlight): any {
    return {
      bookingId: booking._id,
      pnr: booking.pnr,
      airline: flight.airline,
      flightNumber: flight.flightNumber,
      departureCity: flight.departureCity,
      departureAirport: flight.departureAirport,
      departureCode: flight.departureCode,
      departureTime: flight.departureTime,
      arrivalCity: flight.arrivalCity,
      arrivalAirport: flight.arrivalAirport,
      arrivalCode: flight.arrivalCode,
      arrivalTime: flight.arrivalTime,
      duration: flight.duration,
      aircraft: flight.aircraft,
      bookingDate: booking.bookingDate,
      totalAmount: booking.totalAmount,
      passengers: booking.passengers.map((passenger, index) => ({
        ...passenger,
        seat: booking.seatNumbers[index] || "Not assigned",
      })),
    };
  }
}
