#Microbit-Game:Paper.io

一个通过microbit单片机作为控制手柄的paper.io游戏,界面是一个利用django搭建的网站
运行需要的依赖:django 2.0.4, pyserial

##运行指南
0. 在game.py中设置本机的串口的标识符(查看方式见后)
1. 连接microbit至电脑的USB口(记得烧录代码,并且不同手柄用板子烧录的ID需不同!)
2. 在本目录打开命令行,或者在命令行中切换到本游戏根目录,输入以下命令:
``
python3 game.py
python3 MBGame/manage.py runserver 8080
``
3.在浏览器打开`localhost:8080/paperio/game`
4.Have Fun!

##查看串口标识符的方法
###Mac
`ls /dev/tty.usbmodem*`
###Linux
欢迎补充,可能和Mac差不多
###Windows
欢迎补充

##代码烧录事项
* 在两个手柄用板上烧录client.py,并且文件中的ID常量需手动设置为不同(1和2)
* 在主控板(连接电脑)上烧录main_stub.py

##注意事项
1. 记得烧录代码,并且不同手柄用板子烧录的ID需不同!
