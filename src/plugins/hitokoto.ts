import { createMsg2call } from 'message2call'
import { toast } from '@/utils/tools'

function GetAHitokoto() {
  return new Promise((ok, err) => {
    fetch(`https://v1.hitokoto.cn`)
      .then(response => response.json())
      .then(data => {
        return data.hitokoto;
      })
      .then(ok)
      .catch(err);
  });
}
    
const message2read = createMsg2call({
  funcsObj: {
    finished() {
      toast(GetAHitokoto)
    },
  }
}
)

message2read