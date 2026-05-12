<div id="profileModal" class="modal">
  <div class="card modal-card">
    <div class="content-head">
      <h3 class="content-title">View / Edit Profile</h3>
      <button class="btn-secondary icon-btn" type="button" data-close-modal="profileModal"><i class="fa-solid fa-xmark"></i></button>
    </div>
    <form id="profileForm">
      <div>
        <label for="profileName">Name</label>
        <input id="profileName" type="text" />
      </div>
      <div>
        <label for="profileEmail">Email</label>
        <input id="profileEmail" type="email" />
      </div>
      <div>
        <label for="profilePassword">Change password</label>
        <input id="profilePassword" type="password" placeholder="Leave blank to keep current" />
      </div>
      <button class="btn-primary icon-btn-text" type="submit"><i class="fa-solid fa-floppy-disk"></i><span>Save changes</span></button>
    </form>
  </div>
</div>
