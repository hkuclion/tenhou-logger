/**
 * Created by hkuclion on 2017/4/17.
 */
define(['class/assistWindow/TenhouGame'],function (TenhouGame) {
	let ipcRenderer = require('electron').ipcRenderer;

	return class MessageDispatch {
		constructor() {
			this.game = null;

			ipcRenderer.on('TENHOU_WEB_MESSAGE', (ev, data) => {
				try{
					this.command(JSON.parse(data));
				}catch(e){}
			});
		}

		command(command) {
			switch (command.tag) {
				case 'GO': {
					this.game = new TenhouGame(parseInt(command.type));
					break;
				}
				case 'INIT': {
					if (!this.game){
						this.game = new TenhouGame(null);
					}

					let seed = command.seed.split(',').map(number => parseInt(number));
					let hai = command.hai.split(',').map(number => parseInt(number));
					let oya = parseInt(command.oya);
					let ten = command.ten.split(',').map(number => parseInt(number));

					this.game.startKyoku(seed[0], oya, seed.slice(5), hai, ten[0]);

					break;
				}
				case 'REINIT': {
					if (!this.game) {
						this.game = new TenhouGame(null);
					}
					let seed = command.seed.split(',').map(number => parseInt(number));
					let hai = command.hai.split(',').map(number => parseInt(number));
					let oya = parseInt(command.oya);
					let ten = command.ten.split(',').map(number => parseInt(number));
					this.game.startKyoku(seed[0], oya, seed.slice(5), hai, ten[0]);

					if(command.m0){
						let m = command.m0.split(',').map(number => parseInt(number));
						for(let naki of m){
							this.game.kyoku.nakiTehai(naki);
						}
					}
					if (command.kawa0) {
						let kawa = command.kawa0.split(',').map(number => parseInt(number));
						for (let hai of kawa) {
							this.game.kyoku.daTehai(hai);
						}
					}

					for(let i=1; i<3; i++){
						if(command['m'+i]){
							let m = command['m' + i].split(',').map(number => parseInt(number));
							for (let naki of m) {
								this.game.kyoku.nakiHai(naki,i);
							}
						}
						if (command['kawa' + i]) {
							let kawa = command['kawa' + i].split(',').map(number => parseInt(number));
							for (let hai of kawa) {
								this.game.kyoku.daHai(hai,null, i);
							}
						}
					}

					break;
				}
				case 'DORA':{
					if(!this.game || !this.game.kyoku)break;
					this.game.kyoku.addDora(parseInt(command.hai));
					break;
				}
				case 'AGARI':
				case 'RYUUKYOKU':{
					this.game.kyoku.end(command.tag,command);
					break;
				}
				case 'N': {
					if (!this.game || !this.game.kyoku)break;

					let who = parseInt(command.who);
					if (who === 0) {
						this.game.kyoku.nakiTehai(parseInt(command.m));
					}
					else {
						this.game.kyoku.nakiHai(parseInt(command.m), who);
					}

					break;
				}
				default: {
					if (!this.game || !this.game.kyoku)break;

					let matched = command.tag.match(/^([tduevfwg])(\d+)?$/i);
					if (matched) {
						let from = matched[1].toUpperCase();
						switch (from) {
							case 'T':
								this.game.kyoku.moTehai(parseInt(matched[2]), command.t);
								break;
							case 'D':
								this.game.kyoku.daTehai(parseInt(matched[2]));
								break;
							case 'U':
							case 'V':
							case 'W':
								//this.game.moHai();
								break;
							case 'E':
							case 'F':
							case 'G':
								this.game.kyoku.daHai(parseInt(matched[2]), command.t, from.charCodeAt(0) - 'D'.charCodeAt(0));
								break;
						}
					}
					else {
						console.info(`SKIP TAG[${command.tag}]`);
					}
					break;
				}
			}
		}
	}
});