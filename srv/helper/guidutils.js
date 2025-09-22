module.exports = {
    createGuid: () => {
        const n1 = 1, n16 = 16, nCalc = 0x10000;

        function s4() {
            return Math.floor((n1 + Math.random()) * nCalc).toString(n16).substring(n1);
        }

        return `${s4() + s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
    }
};