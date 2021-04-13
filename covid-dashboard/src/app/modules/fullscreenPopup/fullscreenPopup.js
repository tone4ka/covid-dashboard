// import Abstract from '../abstract/abstract';
import create from '../utils/create';

export default class FullScreenPopup {
  constructor(activeBlock) {
    this.activeBlock = activeBlock;
    this.elements = {};
    this.createExpandIcon();
  }

  createExpandIcon() {
    this.activeBlock.style.position = 'relative';
    this.elements.expandIcon = create('span', 'expand-button');
    this.elements.expandIcon.innerHTML = '<i class="fas fa-expand-arrows-alt expand-button__icon"></i>';
    this.activeBlock.prepend(this.elements.expandIcon);
    this.elements.expandIcon.style.display = 'none';
    window.addEventListener('resize', () => {
      if (window.innerWidth > 767 && !this.activeBlock.classList.contains('fullscreen')) {
        this.elements.expandIcon.style.display = 'none';
      } else this.elements.expandIcon.style.display = 'flex';
    });
    this.elements.expandIcon.addEventListener('click', () => {
      if (this.activeBlock.classList.contains('fullscreen')) {
        this.closePopup();
      } else this.generatePopup();
    });
    if (window.innerWidth > 767) {
      this.activeBlock.addEventListener('mouseenter', () => {
        this.elements.expandIcon.animate([
          { display: 'flex', opacity: '0.1' }, { opacity: '0.4' }, { opacity: '1' },
        ],
        { duration: 200 });
        this.elements.expandIcon.style.display = 'flex';
        this.activeBlock.addEventListener('mouseleave', () => {
          this.elements.expandIcon.animate([
            { opacity: '0.4' }, { opacity: '0' },
          ],
          { duration: 200 });
          this.elements.expandIcon.style.display = 'none';
        });
      });
    } else {
      this.elements.expandIcon.style.display = 'flex';
    }
  }

  generatePopup() {
    if (this.activeBlock.classList.contains('map')) {
      for (let i = 0; i < this.activeBlock.children.length; i += 1) {
        if (this.activeBlock.children[i].classList.contains('map-inner')) {
          this.activeBlock.children[i].style.maxWidth = '800px';
          this.activeBlock.children[i].style.margin = '0 auto';
        }
      }
    }
    this.activeBlock.classList.add('fullscreen');
    this.activeBlock.style.position = '';
    this.elements.expandIcon.style.display = 'flex';

    const bodyBlackout = create('div', 'blackout', null, document.body);
    document.body.prepend(bodyBlackout);
    document.body.classList.add('block-scroll');
    bodyBlackout.addEventListener('click', () => {
      this.closePopup();
    });
  }

  closePopup() {
    if (this.activeBlock.classList.contains('map')) {
      for (let i = 0; i < this.activeBlock.children.length; i += 1) {
        if (this.activeBlock.children[i].classList.contains('map-inner')) {
          this.activeBlock.children[i].style.maxWidth = '';
          this.activeBlock.children[i].style.margin = '';
        }
      }
    }
    if (window.innerWidth > 767) {
      this.elements.expandIcon.style.display = 'none';
    }
    this.activeBlock.classList.remove('fullscreen');
    this.activeBlock.style.position = 'relative';
    document.body.classList.remove('block-scroll');
    document.body.children[0].remove(); // removes backout
  }
}
