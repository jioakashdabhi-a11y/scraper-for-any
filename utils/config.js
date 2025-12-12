export const delay = (min = 400, max = 1200) => {
    return new Promise(res => setTimeout(res, Math.random() * (max - min) + min))
}
