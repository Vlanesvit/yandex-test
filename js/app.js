class Slider {
	constructor(selector, options) {
		const defaultOptions = {
			slidesPerView: 1,
			spaceBetween: 0,
			autoplay: {
				enabled: false,
				autoplayDelay: 4000
			},
			loop: false,
			pagination: {
				enabled: true,
				type: 'bullet'
			},
			breakpoints: {}
		};

		this.options = { ...defaultOptions, ...options };

		this.slider = document.querySelector(selector);
		this.sliderWrapper = this.slider.querySelector('.slider-wrapper');
		this.slides = this.sliderWrapper.querySelectorAll('.slide');
		this.prevButton = this.slider.querySelector('.prev');
		this.nextButton = this.slider.querySelector('.next');
		this.pagination = this.slider.querySelector('.pagination');
		this.currentIndex = 0;
		this.autoplayTimer = null;

		this.applyBreakpointSettings();
	}

	init() {
		console.log('Инициализация слайдера');
		this.updateSlider();
		this.updatePagination();
		this.updateFraction();

		this.prevButton.addEventListener('click', () => this.prevSlide());
		this.nextButton.addEventListener('click', () => this.nextSlide());

		if (this.options.autoplay.enabled) {
			this.startAutoplay();
			this.slider.addEventListener('mouseenter', () => this.stopAutoplay());
			this.slider.addEventListener('mouseleave', () => this.startAutoplay());
		}

		window.addEventListener('resize', () => this.applyBreakpointSettings());
	}

	applyBreakpointSettings() {
		const breakpoints = this.options.breakpoints;
		const windowWidth = window.innerWidth;
		let activeBreakpoint = null;

		for (let breakpoint in breakpoints) {
			if (windowWidth >= breakpoint) {
				activeBreakpoint = breakpoints[breakpoint];
			}
		}

		if (activeBreakpoint && activeBreakpoint.destroy) {
			this.destroy();
			this.slider.classList.remove('slider-init');
		} else {
			if (!this.slider.classList.contains('slider-init')) {
				this.init();
				this.slider.classList.add('slider-init');
			}
			Object.assign(this.options, activeBreakpoint);
			this.updateSlider();
		}
	}

	updateSlider() {
		console.log('Обновление слайдера');
		const totalWidth = this.slider.clientWidth;
		const slideWidth = (totalWidth - (this.options.slidesPerView - 1) * this.options.spaceBetween) / this.options.slidesPerView;

		this.slides.forEach((slide, index) => {
			slide.style.width = `${slideWidth}px`;
			slide.style.marginRight = index < this.slides.length - 1 ? `${this.options.spaceBetween}px` : '0';
		});

		this.updateSliderPosition();
	}

	updateSliderPosition() {
		const offset = -this.currentIndex * (this.slides[0].offsetWidth + this.options.spaceBetween);
		this.sliderWrapper.style.transform = `translateX(${offset}px)`;
	}

	nextSlide() {
		console.log('Следующий слайд');
		const totalPages = this.slides.length - this.options.slidesPerView + 1;
		if (this.currentIndex < totalPages - 1) {
			this.currentIndex++;
		} else if (this.options.loop) {
			this.currentIndex = 0;
		}
		this.updateSliderPosition();
		this.updatePagination();
		this.updateFraction();
	}

	prevSlide() {
		console.log('Предыдущий слайд');
		const totalPages = this.slides.length - this.options.slidesPerView + 1;
		if (this.currentIndex > 0) {
			this.currentIndex--;
		} else if (this.options.loop) {
			this.currentIndex = totalPages - 1;
		}
		this.updateSliderPosition();
		this.updatePagination();
		this.updateFraction();
	}

	startAutoplay() {
		console.log('Запуск автопрокрутки');
		this.autoplayTimer = setInterval(() => this.nextSlide(), this.options.autoplay.autoplayDelay);
	}

	stopAutoplay() {
		console.log('Остановка автопрокрутки');
		clearInterval(this.autoplayTimer);
	}

	updatePagination() {
		if (this.options.pagination.enabled) {
			console.log('Обновление пагинации');
			if (!this.pagination) return;
			this.pagination.innerHTML = '';

			const totalPages = Math.ceil(this.slides.length / this.options.slidesPerView);

			for (let i = 0; i < totalPages; i++) {
				const dot = document.createElement('span');
				dot.className = 'dot';
				if (i === Math.floor(this.currentIndex / this.options.slidesPerView)) {
					dot.classList.add('active');
				}
				dot.addEventListener('click', () => {
					this.currentIndex = i * this.options.slidesPerView;
					this.updateSliderPosition();
					this.updatePagination();
					this.updateFraction();
				});
				this.pagination.appendChild(dot);
			}

			this.pagination.className = 'pagination';
			this.pagination.classList.add(`pagination-${this.options.pagination.type}`);
		}
	}

	updateFraction() {
		console.log('Обновление фракции');
		if (this.options.pagination.enabled && this.options.pagination.type === 'fraction' && this.pagination) {
			const totalPages = this.slides.length - this.options.slidesPerView + 1;
			const currentPage = this.currentIndex + 1;
			this.pagination.textContent = `${currentPage} / ${totalPages}`;
		}
	}

	destroy() {
		console.log('Удаление слайдера');
		this.prevButton.removeEventListener('click', () => this.prevSlide());
		this.nextButton.removeEventListener('click', () => this.nextSlide());
		clearInterval(this.autoplayTimer);
		this.slider.classList.remove('slider-init');
		if (this.pagination) this.pagination.innerHTML = '';
	}
}

// Пример использования класса Slider
const slider1 = new Slider('#slider1', {
	slidesPerView: 1,
	spaceBetween: 10,
	pagination: {
		enabled: true,
		type: 'bullet'
	},
	breakpoints: {
		991.98: {
			destroy: true
		}
	}
});

const slider2 = new Slider('#slider2', {
	slidesPerView: 3,
	spaceBetween: 10,
	autoplay: {
		enabled: true,
		autoplayDelay: 4000
	},
	loop: true,
	pagination: {
		enabled: true,
		type: 'fraction'
	}
});
