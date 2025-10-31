let semesterCount = 1;
let chartInstance = null;

function addSemester() {
  semesterCount++;
  const container = document.getElementById("semesters");

  const newSem = document.createElement("div");
  newSem.classList.add("sem");
  newSem.innerHTML = `
    <label>Semester ${semesterCount} GPA:</label>
    <input type="number" class="gpa" placeholder="e.g. 8.5" min="0" max="10" step="0.01">
    <label>Credits:</label>
    <input type="number" class="credits" placeholder="e.g. 24" min="1" max="50">
  `;

  container.appendChild(newSem);
}

function calculateCGPA() {
  const gpaInputs = document.querySelectorAll(".gpa");
  const creditInputs = document.querySelectorAll(".credits");

  let totalWeightedGPA = 0;
  let totalCredits = 0;
  let data = [];

  for (let i = 0; i < gpaInputs.length; i++) {
    const gpa = parseFloat(gpaInputs[i].value);
    const credits = parseFloat(creditInputs[i].value);

    if (!isNaN(gpa) && !isNaN(credits) && gpa >= 0 && gpa <= 10 && credits > 0) {
      totalWeightedGPA += gpa * credits;
      totalCredits += credits;
      data.push({ semester: i + 1, gpa, credits });
    }
  }

  if (totalCredits === 0) {
    document.getElementById("result").innerText = "⚠️ Please enter valid GPA and credit values!";
    return;
  }

  const cgpa = (totalWeightedGPA / totalCredits).toFixed(2);
  const percentage = (cgpa * 9.5).toFixed(2);

  document.getElementById("result").innerHTML = `
    🎓 <strong>Your CGPA:</strong> ${cgpa}<br>
    📊 <strong>Equivalent Percentage:</strong> ${percentage}%
  `;

  renderTable(data);
  renderChart(data);
}

function renderTable(data) {
  let tableHTML = `
    <table>
      <tr>
        <th>Semester</th>
        <th>GPA</th>
        <th>Credits</th>
      </tr>
  `;

  data.forEach(d => {
    tableHTML += `<tr><td>${d.semester}</td><td>${d.gpa}</td><td>${d.credits}</td></tr>`;
  });

  tableHTML += `</table>`;
  document.getElementById("summaryTable").innerHTML = tableHTML;
}

function renderChart(data) {
  const ctx = document.getElementById("gpaChart").getContext("2d");
  const labels = data.map(d => `Sem ${d.semester}`);
  const gpas = data.map(d => d.gpa);

  if (chartInstance) chartInstance.destroy();

  chartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'GPA Trend',
        data: gpas,
        borderColor: '#0078ff',
        backgroundColor: 'rgba(0, 120, 255, 0.1)',
        fill: true,
        tension: 0.2,
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true, max: 10 } }
    }
  });
}

function resetCalculator() {
  document.getElementById("semesters").innerHTML = `
    <div class="sem">
      <label>Semester 1 GPA:</label>
      <input type="number" class="gpa" placeholder="e.g. 8.5" min="0" max="10" step="0.01">
      <label>Credits:</label>
      <input type="number" class="credits" placeholder="e.g. 24" min="1" max="50">
    </div>
  `;
  document.getElementById("summaryTable").innerHTML = "";
  document.getElementById("result").innerText = "";
  document.getElementById("gpaChart").getContext("2d").clearRect(0, 0, 300, 150);
  semesterCount = 1;
  if (chartInstance) chartInstance.destroy();
}

function downloadPDF() {
  const element = document.getElementById("reportContent");

  // Wait a bit so chart finishes drawing before exporting
  setTimeout(() => {
    const options = {
      margin: 0.5,
      filename: 'BTech_CGPA_Report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    html2pdf().set(options).from(element).save();
  }, 500);
}
