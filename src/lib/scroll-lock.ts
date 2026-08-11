/** Reference-counted scroll lock shared by header, cart, lightbox, admin, etc. */

let lockCount = 0;

export function lockScroll() {
  lockCount += 1;
  if (lockCount === 1) {
    document.documentElement.style.overflow = "hidden";
  }
}

export function unlockScroll() {
  lockCount = Math.max(0, lockCount - 1);
  if (lockCount === 0) {
    resetScrollLock();
  }
}

export function resetScrollLock() {
  lockCount = 0;
  document.body.style.overflow = "";
  document.body.style.position = "";
  document.body.style.top = "";
  document.body.style.width = "";
  document.body.style.paddingRight = "";
  document.documentElement.style.overflow = "";
}
