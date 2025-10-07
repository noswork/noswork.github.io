export const showModal = (modalId) => {
    const modal = document.getElementById(modalId);
    modal?.classList.add('show');
};

export const hideModal = (modalId) => {
    const modal = document.getElementById(modalId);
    modal?.classList.remove('show');
};

export const toggleClass = (selector, className, shouldAdd) => {
    document.querySelectorAll(selector).forEach((element) => {
        element.classList.toggle(className, shouldAdd);
    });
};

export const listenClickOutside = (elementId, callback) => {
    const element = document.getElementById(elementId);
    element?.addEventListener('click', (event) => {
        if (event.target.id === elementId) {
            callback();
        }
    });
};

