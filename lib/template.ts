export const htmlTemplate = `
<div class="simplepicker-wrapper">
  <div class="simpilepicker-date-picker">
    <div class="simplepicker-day-header"></div>
      <div class="simplepicker-date-section">
        <div class="simplepicker-month-and-year"></div>
        <div class="simplepicker-date"></div>
        <div class="simplepicker-select-pane">
          <button class="simplepicker-icon simplepicker-icon-calender active" title="Seleccionar fecha del calendario!"></button>
          <div class="simplepicker-time">12:00 PM</div>
          <button class="simplepicker-icon simplepicker-icon-time" title="Select time"></button>
        </div>
      </div>
      <div class="simplepicker-picker-section">
        <div class="simplepicker-calender-section">
          <div class="simplepicker-month-switcher simplepicker-select-pane">
            <button class="simplepicker-icon simplepicker-icon-previous"></button>
            <div class="simplepicker-selected-date"></div>
            <button class="simplepicker-icon simplepicker-icon-next"></button>
          </div>
          <div class="simplepicker-calender">
            <table>
              <thead>
                <tr><th>Dom</th><th>Lun</th><th>Mar</th><th>Míe</th><th>Jue</th><th>Vie</th><th>Sab</th></tr>
              </thead>
              <tbody>
                ${'<tr><td></td><td></td><td></td><td></td><td></td><td></td><td></td></tr>'.repeat(
									6,
								)}
              </tbody>
            </table>
          </div>
        </div>
        <div class="simplepicker-time-section">
          <div class='simplepicker-time-section-div'>
            <input type="time" value="12:00" autofocus="false">          
          </div>
        </div>
      </div>
      <div class="simplepicker-bottom-part">
        <button class="simplepicker-cancel-btn simplepicker-btn" title="Cancel">Cancelar</button>
        <button class="simplepicker-ok-btn simplepicker-btn" title="OK">Aceptar</button>
      </div>
  </div>
</div>
`;
