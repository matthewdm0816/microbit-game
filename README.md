# Microbit-Game:Paper.io
> May the force be with you.

一个通过microbit单片机作为控制手柄的paper.io游戏,界面是一个利用django搭建的网站  
运行需要的依赖:django 2.0.4, pyserial  

## 运行指南
0. 在game.py中设置本机的串口的标识符(查看方式见后)
1. 连接microbit至电脑的USB口(记得烧录代码,并且不同手柄用板子烧录的ID需不同!)
2. 在本目录打开命令行,或者在命令行中切换到本游戏根目录,输入以下命令:  
```shell
python3 game.py
```
并在另一个命令行窗口中运行以下命令:
```shell
cd MBGame
python3 manage.py runserver 8080  
```
3. 在浏览器打开`localhost:8080/paperio/game`
4. Have Fun!

## 查看串口标识符的方法

### Mac
`ls /dev/tty.usbmodem*`
列出的目录名即为串口标识符
### Linux
欢迎补充,可能和Mac差不多
### Windows
应该为"COM*",*为一个较小数字,暂时不知如何得知此数字,欢迎各位大佬补充
经试验可以得到正确的数字(一般小于10)

## 代码烧录事项
* 在两个手柄用板上烧录client.py,并且文件中的ID常量需手动设置为不同(1和2)
* 在主控板(连接电脑)上烧录main_stub.py

## 注意事项
1. 记得烧录代码,并且不同手柄用板子烧录的ID需不同!
2. 如果网页打不开,试试`127.0.0.1:8080/paperio/game`
3. **不要用IE打开,不要用IE打开,不要用IE打开!**(重要的事情说三遍)

## TODO(虽然可能再也不会写了OvO)
1. 增加多人支持,支持三人及以上的游戏模式.
2. 增加背景音乐,增加暂停功能.
3. 修复可能的bug,增加网页游戏性能.




