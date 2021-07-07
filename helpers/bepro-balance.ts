import BeproService from '../services/bepro';

const BeproBalance = async () => {
    await BeproService.login();
    return await BeproService.network.getBEPROStaked()
}

export { BeproBalance }