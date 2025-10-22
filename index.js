const BLESS_TYPES = [
  { id: 'affinity', name: 'Affinity' },
  { id: 'credit', name: 'Credit' },
  { id: 'resource', name: 'Resource' },
  { id: 'damage', name: 'Damage' },
  { id: 'health', name: 'Health' },
  { id: 'shield', name: 'Shield' },
];

export default {
  async fetch(request) {
    if (request.method === 'POST') {
      const formData = await request.formData();
      const region = formData.get('region');
      const relay_name = formData.get('relay_name');
      const relay_instance = formData.get('relay_instance');
      const affinity_bless = formData.get('affinity_bless');
      const credit_bless = formData.get('credit_bless');
      const resource_bless = formData.get('resource_bless');
      const damage_bless = formData.get('damage_bless');
      const health_bless = formData.get('health_bless');
      const shield_bless = formData.get('shield_bless');
      const backup_bless = formData.get('backup_bless');
      
      const now = new Date();
      const nextHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() + 1, 0, 0, 0);
      const wait_minutes = Math.floor((nextHour - now) / 60000);

      const output_lines = []; // Will be an array of {label, content}

      // Create a more structured list of blessers and their roles
      const blesser_assignments = [
        { user: affinity_bless, type: BLESS_TYPES[0] }, // Affinity
        { user: credit_bless, type: BLESS_TYPES[1] },   // Credit
        { user: resource_bless, type: BLESS_TYPES[2] }, // Resource
        { user: damage_bless, type: BLESS_TYPES[3] },   // Damage
        { user: health_bless, type: BLESS_TYPES[4] },   // Health
        { user: shield_bless, type: BLESS_TYPES[5] },   // Shield
      ];

      const active_blessers = blesser_assignments.filter(b => b.user);

      // 1. !bless command
      const active_bless_ids = active_blessers.map(b => b.type.id).join(' ');
      let bless_command = `!bless ${region} ${relay_name} ${relay_instance} ${wait_minutes} min `;
      bless_command += active_bless_ids;
      output_lines.push({ label: 'Bot Command', content: bless_command });

      // 2. Roles message
      let roles_message = "BLESSING ROLES: ";
      active_blessers.forEach(b => {
        roles_message += `@${b.user} -> ${b.type.name} | `;
      });
      if (backup_bless) roles_message += `@${backup_bless} -> Backup  | `;
      roles_message += `Blessing in ${wait_minutes} minutes`;
      output_lines.push({ label: 'Squad Message', content: roles_message });

      // 3. Nag whispers
      const region_map = {"as": "Asia", "eu": "Europe", "na": "NorthAmerica"};
      const region_full = region_map[region] || "Unknown";
      const nag_message = `Reminder for bless at ${relay_name.charAt(0).toUpperCase() + relay_name.slice(1)} ${relay_instance} in ${region_full} region. You'll be on`;
      active_blessers.forEach(b => {
        output_lines.push({ label: `Whisper ${b.user}`, content: `/w ${b.user} ${nag_message} ${b.type.name}` });
      });

      // 4. Roll call and thanks
      if (active_blessers.length > 0) {
        const roll_call_users = active_blessers.map(b => b.user);
        output_lines.push({ label: 'Roll Call', content: 'Roll call. @' + roll_call_users.join(' @') + ' :clem:' });
        output_lines.push({ label: 'Thank You', content: 'Thanks to ' + roll_call_users.join(', ') + ' for blessing' });
      }
      
      const html = renderHTML(output_lines, formData);
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });

    } else {
      const html = renderHTML("", null);
      return new Response(html, { headers: { 'Content-Type': 'text/html' } });
    }
  },
};

function renderHTML(output, formData) {
  const getFormValue = (field) => formData ? (formData.get(field) || '') : ''; // Keep this for form repopulation
  const isSelected = (field, value) => formData ? (formData.get(field) === value ? 'selected' : '') : '';

  return `
  <!doctype html>
  <html lang="en">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1">
      <meta name="color-scheme" content="dark light">
      <title>Warframe Bless Helper</title>
      <script>
        // Critical theme application: run as early as possible to avoid flash of incorrect theme.
        (function(){
          try {
            var theme = localStorage.getItem('theme') || 'dark'; // Default to dark
            if (theme === 'dark') {
              document.documentElement.classList.add('dark');
            }
          } catch(e) { /* ignore */ }
        })();
      </script>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <style>
  :root{
    --bg:#f8f9fa;
    --text:#212529;
    --card-bg:#fff;
    --input-bg:#ffffff;
    --border:rgba(0,0,0,0.125);
  }
  .dark{
    --bg:#0b1220;
    --text:#e6edf3;
    --card-bg:#0f1724;
    --input-bg:#0b1220;
    --border:rgba(255,255,255,0.12);
  }
  html,body{background:var(--bg);color:var(--text);} 
  .card, .card-body, .card-header{background:var(--card-bg);color:var(--text);border-color:var(--border)}
  /* make form inputs and selects follow the input background variable so dropdowns are dark in dark mode */
  .form-control, .form-select{background-color:var(--input-bg);color:var(--text);border-color:var(--border)}
  .form-select option{background-color:var(--input-bg);color:var(--text)}
  /* keep dark caret SVG but ensure it contrasts */
  .dark .form-select { background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3e%3cpath fill='none' stroke='%23e6edf3' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m2 5 6 6 6-6'/%3e%3c/svg%3e"); background-repeat: no-repeat; background-position: right .75rem center; }
  code{background:rgba(0,0,0,0.04);padding:.15rem .3rem;border-radius:.25rem}
  .dark .text-muted { color: rgba(230, 237, 243, 0.6) !important; }
  </style>
    </head>
    <body>
      <div class="container mt-5">
        <div class="d-flex align-items-start justify-content-between mb-3">
          <div>
            <h1 class="display-4 mb-0">Warframe Bless Helper</h1>
            <p class="lead mb-0">Generate blessing messages for Warframe relays.</p>
          </div>
          <div class="ms-3">
            <button id="theme-toggle" class="btn btn-outline-secondary" aria-pressed="false" aria-label="Toggle color theme" title="Toggle color theme">🌙 <span id="theme-toggle-label">Dark</span></button>
          </div>
        </div>
        
        <form method="POST" class="mt-4" autocomplete="off">
          <div class="card">
            <div class="card-header">
              Blessing Setup
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="region" class="form-label">Region</label>
                  <select class="form-select" id="region" name="region">
                    <option value="as" ${isSelected('region', 'as')}>Asia</option>
                    <option value="eu" ${isSelected('region', 'eu')}>Europe</option>
                    <option value="na" ${isSelected('region', 'na')}>North America</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="relay_name" class="form-label">Relay Name</label>
                  <select class="form-select" id="relay_name" name="relay_name">
                    <option value="larunda" ${isSelected('relay_name', 'larunda')}>Larunda</option>
                    <option value="strata" ${isSelected('relay_name', 'strata')}>Strata</option>
                    <option value="kronia" ${isSelected('relay_name', 'kronia')}>Kronia</option>
                    <option value="maroo" ${isSelected('relay_name', 'maroo')}>Maroo</option>
                    <option value="orcus" ${isSelected('relay_name', 'orcus')}>Orcus</option>
                  </select>
                </div>
                <div class="col-md-4 mb-3">
                  <label for="relay_instance" class="form-label">Relay Instance</label>
                  <select class="form-select" id="relay_instance" name="relay_instance">
                    <option value="1" ${isSelected('relay_instance', '1')}>1</option>
                    <option value="2" ${isSelected('relay_instance', '2')}>2</option>
                    <option value="3" ${isSelected('relay_instance', '3')}>3</option>
                    <option value="69" ${isSelected('relay_instance', '69')}>69</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div class="card mt-4">
            <div class="card-header">
              Blessers
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="affinity_bless" class="form-label">Affinity</label>
                  <input type="text" class="form-control" id="affinity_bless" name="affinity_bless" placeholder="Tenno" value="${getFormValue('affinity_bless')}" autocomplete="off">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="credit_bless" class="form-label">Credit</label>
                  <input type="text" class="form-control" id="credit_bless" name="credit_bless" placeholder="Tenno" value="${getFormValue('credit_bless')}" autocomplete="off">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="resource_bless" class="form-label">Resource</label>
                  <input type="text" class="form-control" id="resource_bless" name="resource_bless" placeholder="Tenno" value="${getFormValue('resource_bless')}" autocomplete="off">
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label for="damage_bless" class="form-label">Damage</label>
                  <input type="text" class="form-control" id="damage_bless" name="damage_bless" placeholder="Tenno" value="${getFormValue('damage_bless')}" autocomplete="off">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="health_bless" class="form-label">Health</label>
                  <input type="text" class="form-control" id="health_bless" name="health_bless" placeholder="Tenno" value="${getFormValue('health_bless')}" autocomplete="off">
                </div>
                <div class="col-md-4 mb-3">
                  <label for="shield_bless" class="form-label">Shield</label>
                  <input type="text" class="form-control" id="shield_bless" name="shield_bless" placeholder="Tenno" value="${getFormValue('shield_bless')}" autocomplete="off">
                </div>
              </div>
              <div class="row">
                  <div class="col-md-4 mb-3">
                      <label for="backup_bless" class="form-label">Backup</label>
                      <input type="text" class="form-control" id="backup_bless" name="backup_bless" placeholder="Tenno" value="${getFormValue('backup_bless')}" autocomplete="off">
                  </div>
              </div>
            </div>
          </div>

          <button type="submit" class="btn btn-primary btn-lg mt-4">Generate</button>
        </form>

        ${output ? `
        <div id="generated-output" class="mt-5" role="region" aria-label="Generated output" tabindex="-1">
          <div class="card">
            <div class="card-body">
              ${output.map((line, index, array) => `
                <div class="mb-2">
                  <label for="output-line-${index}" class="form-label small text-muted">${line.label}</label>
                  <div class="d-flex justify-content-between align-items-center">
                    <code id="output-line-${index}" class="flex-grow-1 me-2" tabindex="0">${line.content}</code>
                    <button class="btn btn-sm btn-outline-secondary copy-btn" data-target="output-line-${index}">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-clipboard" viewBox="0 0 16 16">
                      <path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z"/>
                      <path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z"/>
                    </svg>
                  </button>
                </div>
                ${index < array.length - 1 ? '<hr class="my-1 border-secondary">': ''}
              `).join('')}
            </div>
          </div>
        </div>
        ` : ''}

      </div>
      <footer class="footer mt-auto py-3">
        <div class="container text-center">
          <span class="text-muted">Built with Gemini &amp; Copilot</span>
          <span class="mx-2">|</span>
          <a class="text-muted d-inline-flex align-items-center" href="https://github.com/cyroth/ai-playground/tree/master/javascript/warframe-bless-app" target="_blank" rel="noopener noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" focusable="false" class="me-1" style="flex: 0 0 auto;">
              <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38C13.71 14.53 16 11.54 16 8c0-4.42-3.58-8-8-8z"/>
            </svg>
            View on GitHub
          </a>
        </div>
      </footer>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
      <script>
        // Inline simple theme toggle + reset wiring
        (function(){
          function applyTheme(theme){
            if (theme === 'dark') document.documentElement.classList.add('dark');
            else document.documentElement.classList.remove('dark');
          }
          function refreshUI(){
            const isDark = document.documentElement.classList.contains('dark');
            var btnLabel = document.getElementById('theme-toggle-label'); 
            if(btnLabel) btnLabel.textContent = isDark ? 'Light' : 'Dark';
          }
          document.addEventListener('DOMContentLoaded', function(){
            // Set initial UI state based on class applied in <head>
            refreshUI();
            // Attach event listener to toggle and save theme
            var tbtn = document.getElementById('theme-toggle'); 
            if(tbtn) tbtn.addEventListener('click', function(){ 
              var isDark = document.documentElement.classList.toggle('dark'); 
              try { localStorage.setItem('theme', isDark ? 'dark' : 'light'); } catch(e) { /* ignore */ }
              refreshUI(); 
            });
          });
        })();
      </script>
      <script>
        document.querySelectorAll('.copy-btn').forEach(button => {
          button.addEventListener('click', (event) => {
            const clickedButton = event.target.closest('.copy-btn');
            const targetId = clickedButton.dataset.target;
            const textToCopy = document.getElementById(targetId).innerText;
            navigator.clipboard.writeText(textToCopy).then(() => {
              const originalInnerHTML = clickedButton.innerHTML;
              clickedButton.innerText = 'Copied!';
              setTimeout(() => {
                clickedButton.innerHTML = originalInnerHTML;
              }, 1500);
            }).catch(err => {
              console.error('Failed to copy: ', err);
            });
          });
        });
        // If generated output exists, scroll it into view and focus for keyboard users
        (function(){
          var out = document.getElementById('generated-output');
          if(out){
            // Use requestAnimationFrame to wait for layout, then smooth scroll
            requestAnimationFrame(function(){
              try{
                out.scrollIntoView({ behavior: 'smooth', block: 'center' });
                out.focus({ preventScroll: true });
              }catch(e){
                // fallback
                out.scrollIntoView();
                out.focus();
              }
            });
          }
        })();
      </script>
    </body>
  </html>
  `;
}
