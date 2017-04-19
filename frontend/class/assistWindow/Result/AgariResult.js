/**
 * Created by hkuclion on 2017/4/18.
 */
define(function(){
	return class AgariResult{
		constructor(sc,who,fromWho,hai,yaku, ten,yakuman){
			this.componentName='agari-result';
			Object.assign(this,{sc, who, fromWho, hai, yaku, ten, yakuman});

			this.yakuCount = 0;
			for(let [yakuIndex,count] of this.yaku){
				this.yakuCount+=count;
			}
		}
	}
});