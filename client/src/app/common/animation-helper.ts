  /**
 * Adds an `animationend` event listener to an element for a specific animation.
 * Automatically removes the listener after the animation ends.
 *
 * @param element - The HTML element to attach the listener to.
 * @param animationName - The name of the animation to listen for.
 * @param callback - The function to execute when the animation ends.
 */
  export const addAnimationEndListener =(
    element: HTMLElement,
    animationName: string,
    callback: () => void
  ) => {

    const listener = (event: AnimationEvent) => {
      if (event.animationName.includes(animationName)) {
        element.removeEventListener('animationend', listener);
        callback();
      }
    };
    element.addEventListener('animationend', listener);
  }

