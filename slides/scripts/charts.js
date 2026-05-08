/* charts.js
 * Chart.js initialisation for slides/genai.html.
 * Loaded after Chart.js (CDN) and deck.js. All datasets are hand-curated and
 * sources are cited on the slide itself; numbers are baked in here so the deck
 * works fully offline.
 */

(function () {
  if (typeof Chart === "undefined") {
    console.warn("[charts.js] Chart.js not loaded, skipping initialisation.");
    return;
  }

  const accent1 = "#7c9cff";
  const accent2 = "#5eead4";
  const accent3 = "#f4a261";
  const muted   = "#b0b9d8";
  const grid    = "rgba(176, 185, 216, 0.12)";

  Chart.defaults.color = muted;
  Chart.defaults.font.family = "'Inter', system-ui, sans-serif";
  Chart.defaults.borderColor = grid;

  const baseOptions = (yLabel) => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "rgba(15, 18, 32, 0.95)",
        borderColor: "rgba(124, 156, 255, 0.4)",
        borderWidth: 1,
        padding: 10,
        titleColor: "#ffffff",
        bodyColor: "#dfe4f7",
      },
    },
    scales: {
      x: {
        grid: { color: grid, drawBorder: false },
        ticks: { color: muted, font: { size: 11 } },
      },
      y: {
        grid: { color: grid, drawBorder: false },
        ticks: { color: muted, font: { size: 11 } },
        title: yLabel
          ? { display: true, text: yLabel, color: muted, font: { size: 11, weight: "500" } }
          : undefined,
      },
    },
  });

  function init(id, build) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    try {
      build(canvas.getContext("2d"));
    } catch (err) {
      console.error("[charts.js] Failed to render", id, err);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    /* 1. Foundation models released per year (2017-2024)
       Source: Stanford HAI AI Index 2024 (notable model release counts). */
    init("chart-models", (ctx) => {
      const modelHighlights = {
        "2017": "Transformer paper (Google): Attention Is All You Need",
        "2018": "BERT (Google), GPT-1 (OpenAI)",
        "2019": "GPT-2 (OpenAI), XLNet (Google/CMU)",
        "2020": "GPT-3 (OpenAI), T5 (Google)",
        "2021": "Codex (OpenAI), Jurassic-1 (AI21)",
        "2022": "ChatGPT launch (OpenAI), BLOOM (BigScience)",
        "2023": "GPT-4 (OpenAI), Claude (Anthropic), Llama 2 (Meta), Gemini (Google)",
        "2024": "Claude 3.x (Anthropic), Gemini 1.5 (Google), Llama 3 (Meta), GPT-4o (OpenAI)",
      };

      new Chart(ctx, {
        type: "line",
        data: {
          labels: ["2017", "2018", "2019", "2020", "2021", "2022", "2023", "2024"],
          datasets: [{
            label: "Notable foundation models released",
            data: [3, 6, 9, 14, 22, 35, 51, 62],
            borderColor: accent1,
            backgroundColor: "rgba(124, 156, 255, 0.18)",
            fill: true,
            tension: 0.35,
            pointBackgroundColor: accent1,
            pointRadius: 4,
            borderWidth: 2,
          }],
        },
        options: {
          ...baseOptions("Models released"),
          plugins: {
            ...baseOptions("Models released").plugins,
            tooltip: {
              ...baseOptions("Models released").plugins.tooltip,
              callbacks: {
                afterBody: (items) => {
                  const year = items?.[0]?.label;
                  const detail = modelHighlights[year];
                  return detail ? [`Examples: ${detail}`] : [];
                },
              },
            },
          },
        },
      });
    });

    /* 2. Global private investment in generative AI (USD billions, 2019-2023)
       Source: Stanford HAI AI Index 2024 (chapter 4, generative-AI funding). */
    init("chart-investment", (ctx) => {
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: ["2019", "2020", "2021", "2022", "2023"],
          datasets: [{
            label: "Generative AI private investment (USD bn)",
            data: [0.9, 1.5, 3.1, 3.0, 25.2],
            backgroundColor: [
              "rgba(124, 156, 255, 0.55)",
              "rgba(124, 156, 255, 0.6)",
              "rgba(124, 156, 255, 0.7)",
              "rgba(94, 234, 212, 0.6)",
              "rgba(94, 234, 212, 0.85)",
            ],
            borderColor: accent2,
            borderWidth: 1,
            borderRadius: 6,
          }],
        },
        options: baseOptions("USD billions"),
      });
    });

    /* 3. AI adoption by business function (% of organisations using AI in
       at least one function within that area).
       Source: McKinsey "The state of AI 2024". */
    init("chart-adoption", (ctx) => {
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: [
            "Marketing & sales",
            "Product / service dev",
            "Service operations",
            "IT",
            "Knowledge mgmt",
            "Software engineering",
            "HR",
          ],
          datasets: [{
            label: "% of organisations adopting AI in this function",
            data: [34, 25, 24, 22, 21, 19, 13],
            backgroundColor: "rgba(94, 234, 212, 0.55)",
            borderColor: accent2,
            borderWidth: 1,
            borderRadius: 6,
          }],
        },
        options: {
          ...baseOptions("% of organisations"),
          indexAxis: "y",
        },
      });
    });

    /* 4. Task exposure by occupation - share of work tasks where LLMs can
       reduce time by >=50% (E1+E2 exposure scores, paper Table 4 summary).
       Source: Eloundou et al., "GPTs are GPTs", arXiv:2303.10130. */
    init("chart-exposure", (ctx) => {
      new Chart(ctx, {
        type: "bar",
        data: {
          labels: [
            "Mathematicians",
            "Tax preparers",
            "Writers / authors",
            "Web designers",
            "Accountants",
            "PR specialists",
            "Survey researchers",
            "Interpreters",
          ],
          datasets: [{
            label: "% of work tasks exposed to LLMs",
            data: [100, 100, 100, 90, 88, 87, 84, 83],
            backgroundColor: "rgba(244, 162, 97, 0.55)",
            borderColor: accent3,
            borderWidth: 1,
            borderRadius: 6,
          }],
        },
        options: {
          ...baseOptions("% tasks exposed"),
          indexAxis: "y",
          scales: {
            x: {
              ...baseOptions().scales.x,
              suggestedMin: 0,
              suggestedMax: 100,
            },
            y: baseOptions().scales.y,
          },
        },
      });
    });

    /* 5. ChatGPT adoption curve - weekly active users / milestones.
       Sources: OpenAI announcements (Nov 2022 launch, Jan 2023 100M MAU),
       Reuters / Statista timeline, OpenAI DevDay 2024 (200M+ WAU). */
    init("chart-chatgpt", (ctx) => {
      new Chart(ctx, {
        type: "line",
        data: {
          labels: [
            "Dec 2022",
            "Jan 2023",
            "Apr 2023",
            "Aug 2023",
            "Nov 2023",
            "May 2024",
            "Aug 2024",
          ],
          datasets: [{
            label: "Weekly / monthly active users (millions)",
            data: [1, 100, 173, 180, 100, 180, 200],
            borderColor: accent2,
            backgroundColor: "rgba(94, 234, 212, 0.18)",
            fill: true,
            tension: 0.3,
            pointBackgroundColor: accent2,
            pointRadius: 4,
            borderWidth: 2,
          }],
        },
        options: baseOptions("Active users (millions)"),
      });
    });
  });
})();
