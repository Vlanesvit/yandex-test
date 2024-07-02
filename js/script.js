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
		if (this.slider) {
			this.sliderWrapper = this.slider.querySelector('.slider-wrapper');
			this.slides = this.sliderWrapper.querySelectorAll('.slide');
			this.prevButton = this.slider.querySelector('.slider-arrow-prev');
			this.nextButton = this.slider.querySelector('.slider-arrow-next');
			this.pagination = this.slider.querySelector('.slider-pagination');

			this.currentIndex = 0;
			this.autoplayTimer = null;

			this.applyBreakpointSettings();
		}
	}

	// Инициализация слайдера
	init() {
		// console.log('Инициализация слайдера');
		this.updateSlider();
		this.updatePagination();
		this.updateFraction();
		this.updateButtonState();

		this.prevButton.addEventListener('click', () => this.prevSlide());
		this.nextButton.addEventListener('click', () => this.nextSlide());

		if (this.options.autoplay.enabled) {
			this.startAutoplay();
			this.slider.addEventListener('mouseenter', () => this.stopAutoplay());
			this.slider.addEventListener('mouseleave', () => this.startAutoplay());
		}

		window.addEventListener('resize', () => {
			this.applyBreakpointSettings();
			this.updateSlider();
			this.updatePagination();
			this.updateFraction();
			this.updateButtonState();
		});

		window.addEventListener('load', () => {
			this.applyBreakpointSettings();
			this.updateSlider();
			this.updatePagination();
			this.updateFraction();
			this.updateButtonState();
		});
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

	// Обновление слайдера
	updateSlider() {
		// console.log('Обновление слайдера');
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

	// Следующий слайд
	nextSlide() {
		// console.log('Следующий слайд');
		const totalPages = this.slides.length - this.options.slidesPerView + 1;
		if (this.currentIndex < totalPages - 1) {
			this.currentIndex++;
		} else if (this.options.loop) {
			this.currentIndex = 0;
		}
		this.updateSliderPosition();
		this.updatePagination();
		this.updateFraction();
		this.updateButtonState();
	}

	// Предыдущий слайд
	prevSlide() {
		// console.log('Предыдущий слайд');
		const totalPages = this.slides.length - this.options.slidesPerView + 1;
		if (this.currentIndex > 0) {
			this.currentIndex--;
		} else if (this.options.loop) {
			this.currentIndex = totalPages - 1;
		}
		this.updateSliderPosition();
		this.updatePagination();
		this.updateFraction();
		this.updateButtonState();
	}

	// Запуск автопрокрутки
	startAutoplay() {
		// console.log('Запуск автопрокрутки');
		this.autoplayTimer = setInterval(() => this.nextSlide(), this.options.autoplay.autoplayDelay);
	}

	// Остановка автопрокрутки
	stopAutoplay() {
		// console.log('Остановка автопрокрутки');
		clearInterval(this.autoplayTimer);
	}

	// Обновление пагинации
	updatePagination() {
		if (this.options.pagination.enabled) {
			// console.log('Обновление пагинации');
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
					this.updateButtonState();
				});
				this.pagination.appendChild(dot);
			}

			this.pagination.className = 'slider-pagination';
			this.pagination.classList.add(`slider-pagination-${this.options.pagination.type}`);
		}
	}

	// Обновление фракции
	updateFraction() {
		// console.log('Обновление фракции');
		if (this.options.pagination.enabled && this.options.pagination.type === 'fraction' && this.pagination) {
			const totalPages = this.slides.length - this.options.slidesPerView + 1;
			const currentPage = this.currentIndex + 1;

			this.pagination.innerHTML = `<span class="slider-pagination-fraction-count">${currentPage}</span> / ${totalPages}`;
		}
	}

	// Обновление состояния кнопок навигации
	updateButtonState() {
		// console.log('Обновление состояния кнопок навигации');
		if (!this.options.loop) {
			this.prevButton.classList.toggle('disable', this.currentIndex === 0);
			this.nextButton.classList.toggle('disable', this.currentIndex >= this.slides.length - this.options.slidesPerView);
		}
	}

	// Удаление слайдера
	destroy() {
		// console.log('Удаление слайдера');
		this.prevButton.removeEventListener('click', () => this.prevSlide());
		this.nextButton.removeEventListener('click', () => this.nextSlide());
		clearInterval(this.autoplayTimer);
		this.slider.classList.remove('slider-init');
		if (this.pagination) this.pagination.innerHTML = '';

		// Сброс стилей для слайдов
		this.slides.forEach(slide => {
			slide.removeAttribute('style');
		});
		this.sliderWrapper.removeAttribute('style');
	}
}

const sliderStages = new Slider('.stages__slider', {
	slidesPerView: 1,
	spaceBetween: 20,
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

const sliderMember = new Slider('.members__slider', {
	slidesPerView: 1,
	spaceBetween: 32,
	autoplay: {
		enabled: true,
		autoplayDelay: 4000
	},
	loop: true,
	pagination: {
		enabled: true,
		type: 'fraction'
	},
	breakpoints: {
		991.98: {
			slidesPerView: 3,
			spaceBetween: 20,
		}
	}
});

class MousePRLX {
	constructor(props, data = null) {
		let defaultConfig = {
			init: true,
		}
		this.config = Object.assign(defaultConfig, props);
		if (this.config.init) {
			const paralaxMouse = document.querySelectorAll('[data-prlx-mouse]');
			if (paralaxMouse.length) {
				this.paralaxMouseInit(paralaxMouse);
			}
		}
	}
	paralaxMouseInit(paralaxMouse) {
		paralaxMouse.forEach(el => {
			const paralaxMouseWrapper = el.closest('[data-prlx-mouse-wrapper]');

			// Коэф. X 
			const paramСoefficientX = el.dataset.prlxCx ? +el.dataset.prlxCx : 100;
			// Коэф. У 
			const paramСoefficientY = el.dataset.prlxCy ? +el.dataset.prlxCy : 100;
			// Напр. Х
			const directionX = el.hasAttribute('data-prlx-dxr') ? -1 : 1;
			// Напр. У
			const directionY = el.hasAttribute('data-prlx-dyr') ? -1 : 1;
			// Скорость анимации
			const paramAnimation = el.dataset.prlxA ? +el.dataset.prlxA : 50;


			// Объявление переменных
			let positionX = 0, positionY = 0;
			let coordXprocent = 0, coordYprocent = 0;

			setMouseParallaxStyle();

			// Проверяю на наличие родителя, в котором будет считываться положение мыши
			if (paralaxMouseWrapper) {
				mouseMoveParalax(paralaxMouseWrapper);
			} else {
				mouseMoveParalax();
			}

			function setMouseParallaxStyle() {
				const distX = coordXprocent - positionX;
				const distY = coordYprocent - positionY;
				positionX = positionX + (distX * paramAnimation / 1000);
				positionY = positionY + (distY * paramAnimation / 1000);
				el.style.cssText = `transform: translate3D(${directionX * positionX / (paramСoefficientX / 10)}%,${directionY * positionY / (paramСoefficientY / 10)}%,0);`;
				requestAnimationFrame(setMouseParallaxStyle);
			}
			function mouseMoveParalax(wrapper = window) {
				wrapper.addEventListener("mousemove", function (e) {
					const offsetTop = el.getBoundingClientRect().top + window.scrollY;
					if (offsetTop >= window.scrollY || (offsetTop + el.offsetHeight) >= window.scrollY) {
						// Получение ширины и высоты блока
						const parallaxWidth = window.innerWidth;
						const parallaxHeight = window.innerHeight;
						// Ноль по середине
						const coordX = e.clientX - parallaxWidth / 2;
						const coordY = e.clientY - parallaxHeight / 2;
						// Получаем проценты
						coordXprocent = coordX / parallaxWidth * 100;
						coordYprocent = coordY / parallaxHeight * 100;
					}
				});
			}
		});
	}
}
// Запускаем
new MousePRLX({});

function marquee() {
	const marquees = document.querySelectorAll('.marquee');

	marquees.forEach(marquee => {
		const list = marquee.querySelector('.marquee__list');
		const items = list.querySelectorAll('.marquee__list li');

		let scrollAmount = 0; // Переменная для отслеживания текущего смещения
		const speed = 4; // Скорость прокрутки бегущей строки

		// Клонируем элементы для создания бесшовного эффекта
		items.forEach(item => {
			const clone = item.cloneNode(true);
			list.appendChild(clone);
		});

		function scrollMarquee() {
			scrollAmount -= speed;

			list.style.transform = `translateX(${scrollAmount}px)`;

			// Проверяем, если первый элемент полностью вышел из видимой области
			const firstItem = list.firstElementChild;
			const firstItemWidth = firstItem.getBoundingClientRect().width;

			if (firstItem.getBoundingClientRect().right <= 0) {
				list.appendChild(firstItem); // Перемещаем первый элемент в конец списка

				// Пересчитываем смещение, чтобы сделать переход плавным
				scrollAmount += firstItemWidth + parseFloat(getComputedStyle(firstItem).marginLeft);
				list.style.transform = `translateX(${scrollAmount}px)`;
			}

			requestAnimationFrame(scrollMarquee); // Рекурсивно вызываем функцию для плавной анимации
		}

		scrollMarquee();
	});
}
marquee()

function headerScroll() {
	const header = document.querySelector('.header');

	function headerClassAdd() {
		// 0 - на сколько скролим, чтобы дался класс
		header.classList.toggle('_header-scroll', window.scrollY > 0);
	}

	window.addEventListener('scroll', function () {
		headerClassAdd()
	})
}
headerScroll()