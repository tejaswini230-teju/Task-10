document.addEventListener("DOMContentLoaded", function () {

  let allProducts = [];
  let currentCategory = 'Available';

  // SEARCH BAR USING TYPEAHEAD + TOOLTIP

  const searchInput = document.getElementById('searchInput');
  const suggestionsBox = document.getElementById('suggestionsBox');
  const searchForm = document.querySelector('.navbar form');

  if (searchInput && suggestionsBox && searchForm) {
    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();
      suggestionsBox.innerHTML = '';

      if (query === '') return;

      const matchedProducts = allProducts.filter(product =>
        product.name.toLowerCase().includes(query)
      );

      if (matchedProducts.length === 0) {
        suggestionsBox.innerHTML = '<div class="list-group-item text-muted">No products found</div>';
        return;
      }

      matchedProducts.forEach(product => {
        const item = document.createElement('button');
        item.type = 'button';
        item.className = 'list-group-item list-group-item-action';
        item.textContent = product.name;

        item.addEventListener('click', function () {
          searchInput.value = product.name;
          suggestionsBox.innerHTML = '';

          if (typeof renderProducts === "function") {
            renderProducts([product]);
          }
        });

        suggestionsBox.appendChild(item);
      });
    });

    document.addEventListener('click', function (e) {
      if (!searchForm.contains(e.target)) {
        suggestionsBox.innerHTML = '';
      }
    });
  }

  // Bootstrap Tooltip

  const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
  [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl));


  // LIGHTBOX MODAL FOR POPULAR PRODUCTS

  const imageModal = document.getElementById("myModal");
  const modalImg = document.getElementById("img01");
  const captionText = document.getElementById("caption");
  const images = document.getElementsByClassName("myImg");
  const closeBtn = document.getElementsByClassName("close")[0];

  if (imageModal && modalImg && captionText && images.length > 0 && closeBtn) {
    for (let i = 0; i < images.length; i++) {
      images[i].onclick = function () {
        imageModal.style.display = "block";
        modalImg.src = this.src;
        captionText.innerHTML = this.alt;
      };
    }

    closeBtn.onclick = function () {
      imageModal.style.display = "none";
    };
  }

  // CATEGORIES SECTION MAGNIFYING GLASS
  
  const zoomContainers = document.querySelectorAll('.zoom-container');

  if (zoomContainers.length > 0) {
    zoomContainers.forEach(container => {
      const mainImg = container.querySelector('.main-img');
      const magnifier = container.querySelector('.magnifier');
      const zoomImg = container.querySelector('.zoom-img');

      if (!mainImg || !magnifier || !zoomImg) return;

      container.addEventListener('mousemove', function (e) {
        const rect = container.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        magnifier.style.display = 'block';

        // keep magnifier centered
        magnifier.style.left = (x - magnifier.offsetWidth / 2) + 'px';
        magnifier.style.top = (y - magnifier.offsetHeight / 2) + 'px';

        // zoom movement
        zoomImg.style.left = (-x * 2 + 100) + 'px';
        zoomImg.style.top = (-y * 2 + 100) + 'px';
      });

      container.addEventListener('mouseleave', function () {
        magnifier.style.display = 'none';
      });
    });
  }

  function resetSlider() {
    if (allProducts.length > 0) {
      filterCategory(currentCategory);
    }
  }

  // IMPORTANT FIX: path should work for index and sub pages

  let productPath = window.location.pathname.includes("html files")
    ? "../json/products.json"
    : "assets/json/products.json";

  fetch(productPath)
    .then(function (response) {
      if (!response.ok) {
        throw new Error('Failed to load products.json: ' + response.status);
      }
      return response.json();
    })
    .then(function (data) {
      allProducts = data;

      if (document.querySelector('.swiper-wrapper')) {
          filterCategory('Available');
      }
    })
    .catch(function (error) {
      console.error('Error loading JSON:', error);
    });

  function renderProducts(products) {
  let wrapper = document.querySelector('.swiper-wrapper');
  if (!wrapper) return;

  wrapper.innerHTML = '';

  products.forEach(function (product) {
    let discountPrice = (product.price - (product.price * product.discount / 100)).toFixed(0);
    let stars = generateStars(product.rating);

    let viewbtn = '';

    if (product.category === 'Available') {
      viewbtn =
        '<button class="btn btn-success btn-sm w-100 mt-2">' +
        '<i class="bi bi-cart-plus"></i> Add to Cart' +
        '</button>';
    }
    else if (product.category === 'Upcoming') {
      viewbtn =
        '<button class="btn btn-warning btn-sm w-100 mt-2" disabled>' +
        '<i class="bi bi-clock"></i> Coming Soon' +
        '</button>';
    }
    else if (product.category === 'Missed') {
      viewbtn =
       '<button class="btn btn-secondary btn-sm w-100 mt-2" disabled>' +
        '<i class="bi bi-x-circle"></i> Out of Stock' +
        '</button>';
    }

    let slide = document.createElement('div');
    slide.className = 'swiper-slide';

    slide.innerHTML =
      '<div class="card h-100 border-0 shadow-sm position-relative">' +
      '<span class="badge bg-danger position-absolute top-0 end-0 m-2 rounded-pill">' + product.discount + '% OFF</span>' +
      '<img src="' + product.image + '" class="card-img-top" style="height:160px;object-fit:cover;">' +
      '<div class="card-body p-3 d-flex flex-column">' +
      '<h6 class="card-title mb-1">' + product.name + '</h6>' +
      '<div class="mb-1">' + stars + '</div>' +
      '<div class="p-2">' +
      '<span class="text-decoration-line-through text-muted me-1">₹' + product.price + '</span>' +
      '<span class="fw-bold text-success">₹' + discountPrice + '</span>' +
      '</div>' +
      viewbtn +
      '</div>' +
      '</div>';

    wrapper.appendChild(slide);
  });

  // INIT SWIPER AFTER RENDER

  if (window.mySwiper) {
    window.mySwiper.destroy(true, true);
  }

    window.mySwiper = new Swiper(".mySwiper", {
    slidesPerView: 5,
    spaceBetween: 20,
    loop: true,

    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    pagination: {
      el: ".swiper-pagination",
      clickable: true,
    },

    breakpoints: {
      320: { slidesPerView: 1 },
      768: { slidesPerView: 2 },
      1024: { slidesPerView: 3 },
      1200: { slidesPerView: 5 }
    }
  });
}
  function generateStars(rating) {
    let star = '';
    let fullStars = Math.floor(rating);
    let halfStar = (rating - fullStars) >= 0.3;

    for (let i = 0; i < fullStars; i++) {
      star += '<i class="bi bi-star-fill text-warning" style="font-size:0.75rem;"></i>';
    }

    if (halfStar) {
      star += '<i class="bi bi-star-half text-warning" style="font-size:0.75rem;"></i>';
    }

    let remaining = 5 - fullStars - (halfStar ? 1 : 0);

    for (let j = 0; j < remaining; j++) {
      star += '<i class="bi bi-star text-warning" style="font-size:0.75rem;"></i>';
    }

    return star;
  }

  function filterCategory(category) {
    currentCategory = category;

    document.querySelectorAll('#productTabs .nav-link').forEach(function (tab) {
      tab.classList.remove('active');
    });

    let activeTab = document.getElementById('tab-' + category);
    if (activeTab) {
      activeTab.classList.add('active');
    }

    let filtered = allProducts.filter(function (p) {
      return p.category === category;
    });

    renderProducts(filtered);
  }

  window.filterCategory = filterCategory;

  // ABOUT SECTION FEEDBACK STAR RATING

  const feedbackStars = document.querySelectorAll('#feedbackRating i');
  const feedbackText = document.getElementById('feedbackText');

  if (feedbackStars.length > 0 && feedbackText) {
    feedbackStars.forEach(star => {
      star.addEventListener('click', function () {
        const value = Number(this.getAttribute('data-value'));

        colorFeedbackStars(value);

        let message = '';
        switch (value) {
          case 1:
            message = 'Very Bad';
            break;
          case 2:
            message = 'Bad';
            break;
          case 3:
            message = 'Good';
            break;
          case 4:
            message = 'Very Good';
            break;
          case 5:
            message = 'Excellent';
            break;
        }

        feedbackText.textContent = 'You rated us: ' + message;
      });
    });
  }

  function colorFeedbackStars(value) {
    feedbackStars.forEach(star => {
      star.classList.remove('bi-star-fill', 'active');
      star.classList.add('bi-star');
    });

    for (let i = 0; i < value; i++) {
      feedbackStars[i].classList.remove('bi-star');
      feedbackStars[i].classList.add('bi-star-fill', 'active');
    }
  }

  // CONTACT SECTION JS

  const customForm = document.getElementById('customForm');

  if (customForm) {
    customForm.addEventListener('submit', function (event) {
      event.preventDefault();

      let form = this;
      let valid = true;

      let nameInputf = form.querySelector('[name="firstName"]');
      let nameErrorf = document.getElementById('nameErrorf');

      if (!nameInputf.value.trim()) {
        nameInputf.classList.add('is-invalid');
        nameErrorf.textContent = 'Please enter your first name';
        valid = false;
      }
      else if (/\d/.test(nameInputf.value)) {
        nameInputf.classList.add('is-invalid');
        nameErrorf.textContent = 'Name should not contain numbers';
        valid = false;
      }
      else if (/[!@#$%^&*().]/.test(nameInputf.value)) {
        nameInputf.classList.add('is-invalid');
        nameErrorf.textContent = 'Name should not contain special characters';
        valid = false;
      }
      else if (nameInputf.value.length < 3) {
        nameInputf.classList.add('is-invalid');
        nameErrorf.textContent = 'Name must be at least 3 characters long';
        valid = false;
      }
      else {
        nameInputf.classList.remove('is-invalid');
        nameInputf.classList.add('is-valid');
        nameErrorf.textContent = '';
      }

      let nameInputl = form.querySelector('[name="lastName"]');
      let nameErrorl = document.getElementById('nameErrorl');

      if (!nameInputl.value.trim()) {
        nameInputl.classList.add('is-invalid');
        nameErrorl.textContent = 'Please enter your last name';
        valid = false;
      }
      else if (/\d/.test(nameInputl.value)) {
        nameInputl.classList.add('is-invalid');
        nameErrorl.textContent = 'Name should not contain numbers';
        valid = false;
      }
      else if (/[!@#$%^&*().]/.test(nameInputl.value)) {
        nameInputl.classList.add('is-invalid');
        nameErrorl.textContent = 'Name should not contain special characters';
        valid = false;
      }
      else if (nameInputl.value.length < 3) {
        nameInputl.classList.add('is-invalid');
        nameErrorl.textContent = 'Name must be at least 3 characters long';
        valid = false;
      }
      else {
        nameInputl.classList.remove('is-invalid');
        nameInputl.classList.add('is-valid');
        nameErrorl.textContent = '';
      }

      let emailInput = form.querySelector('[name="email"]');
      let emailValue = emailInput.value.trim();
      let emailPattern = /^[^\s@]+@[a-zA-Z]+\.(com|in)$/;

      if (!emailPattern.test(emailValue)) {
        emailInput.classList.add('is-invalid');
        valid = false;
      }
      else {
        emailInput.classList.remove('is-invalid');
        emailInput.classList.add('is-valid');
      }

      let message = form.querySelector('[name="Message"]');
      if (!message.value.trim()) {
        message.classList.add('is-invalid');
        valid = false;
      }
      else {
        message.classList.remove('is-invalid');
        message.classList.add('is-valid');
      }

      form.classList.add('was-validated');

      if (valid) {
        let successModal = document.getElementById('exampleModal');
        if (successModal) {
          let modal = new bootstrap.Modal(successModal);
          modal.show();
        }
      }
    });

    document.querySelectorAll('#customForm input, #customForm textarea').forEach(function (field) {
      field.addEventListener("input", function () {
        field.classList.remove("is-invalid");
      });
    });
  }

  // LOGIN AND REGISTER PAGE JS

  const loginCard = document.querySelector("#login");
  const register = document.querySelector("#register");

  if (loginCard && register) {
    const loginEmail = loginCard.querySelector('input[type="email"]');
    const loginPassword = loginCard.querySelector('input[type="password"]');
    const loginButton = loginCard.querySelector("button.btn-primary");

    const loginEmailError = document.createElement("div");
    loginEmailError.className = "text-danger mt-1 small";
    loginEmail.parentElement.parentElement.appendChild(loginEmailError);

    const loginPasswordError = document.createElement("div");
    loginPasswordError.className = "text-danger mt-1 small";
    loginPassword.parentElement.parentElement.appendChild(loginPasswordError);

    loginButton.addEventListener("click", function (event) {
      event.preventDefault();
      let valid = true;
      const emailPattern = /^[^\s@]+@[a-zA-Z]+\.(com|in)$/;

      if (!loginEmail.value.trim()) {
        loginEmail.classList.add("is-invalid");
        loginEmail.classList.remove("is-valid");
        loginEmailError.textContent = "Please enter your email";
        valid = false;
      } else if (!emailPattern.test(loginEmail.value.trim())) {
        loginEmail.classList.add("is-invalid");
        loginEmail.classList.remove("is-valid");
        loginEmailError.textContent = "Please enter a valid email";
        valid = false;
      } else {
        loginEmail.classList.remove("is-invalid");
        loginEmail.classList.add("is-valid");
        loginEmailError.textContent = "";
      }

      if (!loginPassword.value.trim()) {
        loginPassword.classList.add("is-invalid");
        loginPassword.classList.remove("is-valid");
        loginPasswordError.textContent = "Please enter your password";
        valid = false;
      } else if (loginPassword.value.trim().length < 6) {
        loginPassword.classList.add("is-invalid");
        loginPassword.classList.remove("is-valid");
        loginPasswordError.textContent = "Password must be at least 6 characters";
        valid = false;
      } else {
        loginPassword.classList.remove("is-invalid");
        loginPassword.classList.add("is-valid");
        loginPasswordError.textContent = "";
      }

      if (valid) {
        alert("Login successful!");
      }
    });

    [loginEmail, loginPassword].forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.value.trim()) {
          field.classList.remove("is-invalid");
        }
      });
    });

    const registerInputs = register.querySelectorAll("input");

    const fullName = registerInputs[0];
    const regEmail = registerInputs[1];
    const regPassword = registerInputs[2];
    const confirmPassword = registerInputs[3];
    const registerButton = register.querySelector("button.btn-success");

    const fullNameError = document.createElement("div");
    fullNameError.className = "text-danger mt-1 small";
    fullName.parentElement.appendChild(fullNameError);

    const regEmailError = document.createElement("div");
    regEmailError.className = "text-danger mt-1 small";
    regEmail.parentElement.appendChild(regEmailError);

    const regPasswordError = document.createElement("div");
    regPasswordError.className = "text-danger mt-1 small";
    regPassword.parentElement.parentElement.appendChild(regPasswordError);

    const confirmPasswordError = document.createElement("div");
    confirmPasswordError.className = "text-danger mt-1 small";
    confirmPassword.parentElement.parentElement.appendChild(confirmPasswordError);

    registerButton.addEventListener("click", function (event) {
      event.preventDefault();
      let valid = true;
      const emailPattern = /^[^\s@]+@[a-zA-Z]+\.(com|in)$/;

      if (!fullName.value.trim()) {
        fullName.classList.add("is-invalid");
        fullName.classList.remove("is-valid");
        fullNameError.textContent = "Please enter your full name";
        valid = false;
      } else if (/\d/.test(fullName.value)) {
        fullName.classList.add("is-invalid");
        fullName.classList.remove("is-valid");
        fullNameError.textContent = "Name should not contain numbers";
        valid = false;
      } else if (/[!@#$%^&*(),.?":{}|<>]/.test(fullName.value)) {
        fullName.classList.add("is-invalid");
        fullName.classList.remove("is-valid");
        fullNameError.textContent = "Name should not contain special characters";
        valid = false;
      } else if (fullName.value.trim().length < 3) {
        fullName.classList.add("is-invalid");
        fullName.classList.remove("is-valid");
        fullNameError.textContent = "Name must be at least 3 characters long";
        valid = false;
      } else {
        fullName.classList.remove("is-invalid");
        fullName.classList.add("is-valid");
        fullNameError.textContent = "";
      }

      if (!regEmail.value.trim()) {
        regEmail.classList.add("is-invalid");
        regEmail.classList.remove("is-valid");
        regEmailError.textContent = "Please enter your email";
        valid = false;
      } else if (!emailPattern.test(regEmail.value.trim())) {
        regEmail.classList.add("is-invalid");
        regEmail.classList.remove("is-valid");
        regEmailError.textContent = "Please enter a valid email";
        valid = false;
      } else {
        regEmail.classList.remove("is-invalid");
        regEmail.classList.add("is-valid");
        regEmailError.textContent = "";
      }

      if (!regPassword.value.trim()) {
        regPassword.classList.add("is-invalid");
        regPassword.classList.remove("is-valid");
        regPasswordError.textContent = "Please create a password";
        valid = false;
      } else if (regPassword.value.trim().length < 6) {
        regPassword.classList.add("is-invalid");
        regPassword.classList.remove("is-valid");
        regPasswordError.textContent = "Password must be at least 6 characters";
        valid = false;
      } else {
        regPassword.classList.remove("is-invalid");
        regPassword.classList.add("is-valid");
        regPasswordError.textContent = "";
      }

      if (!confirmPassword.value.trim()) {
        confirmPassword.classList.add("is-invalid");
        confirmPassword.classList.remove("is-valid");
        confirmPasswordError.textContent = "Please confirm your password";
        valid = false;
      } else if (confirmPassword.value !== regPassword.value) {
        confirmPassword.classList.add("is-invalid");
        confirmPassword.classList.remove("is-valid");
        confirmPasswordError.textContent = "Passwords do not match";
        valid = false;
      } else {
        confirmPassword.classList.remove("is-invalid");
        confirmPassword.classList.add("is-valid");
        confirmPasswordError.textContent = "";
      }

      if (valid) {
        alert("Registration successful!");
      }
    });

    [fullName, regEmail, regPassword, confirmPassword].forEach(function (field) {
      field.addEventListener("input", function () {
        if (field.value.trim()) {
          field.classList.remove("is-invalid");
        }
      });
    });

    const eyeIcon = document.querySelectorAll(".bi-eye, .bi-eye-slash");

    eyeIcon.forEach(function (icon) {
      icon.style.cursor = "pointer";

      icon.addEventListener("click", function () {
        const input = this.closest(".input-group").querySelector("input");

        if (input.type === "password") {
          input.type = "text";
          this.classList.remove("bi-eye");
          this.classList.add("bi-eye-slash");
        } else {
          input.type = "password";
          this.classList.remove("bi-eye-slash");
          this.classList.add("bi-eye");
        }
      });
    });
  }

});