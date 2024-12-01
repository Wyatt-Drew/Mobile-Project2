export async function appendRow(sheetName, values) {
    try {
      const response = await fetch("https://mobile-backend-74th.onrender.com/append-row", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sheetName, values }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to append row");
      }
  
      console.log(`Data added to ${sheetName} successfully!`);
    } catch (error) {
      console.error("Error appending row:", error);
    }
  }
  