#include <emscripten/emscripten.h>
extern "C" {
  EMSCRIPTEN_KEEPALIVE
  int check_collision(int ax,int ay,int aw,int ah,int bx,int by,int bw,int bh){
    if(ax+aw<bx) return 0;
    if(ax>bx+bw) return 0;
    if(ay+ah<by) return 0;
    if(ay>by+bh) return 0;
    return 1;
  }
}
