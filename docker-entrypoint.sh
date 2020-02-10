#!/bin/bash

sed -i 's/127.0.0.1/0.0.0.0/g' /usr/src/app/web/vue/dist/UIconfig.js
sed -i 's/localhost/'${HOST}'/g' /usr/src/app/web/vue/dist/UIconfig.js
sed -i 's/3000/'${PORT}'/g' /usr/src/app/web/vue/dist/UIconfig.js
if [[ "${USE_SSL:-0}" == "1" ]] ; then
    sed -i 's/ssl: false/ssl: true/g' /usr/src/app/web/vue/dist/UIconfig.js
fi

# http://patorjk.com/software/taag/#p=display&f=Standard&t=dockerized%20randobot
echo ""
echo "      _            _             _             _                       _       _           _   "
echo "   __| | ___   ___| | _____ _ __(_)_______  __| |  _ __ __ _ _ __   __| | ___ | |__   ___ | |_ "
echo "  / _\` |/ _ \\ / __| |/ / _ \\ '__| |_  / _ \\/ _\` | | '__/ _\` | '_ \\ / _\` |/ _ \\| '_ \\ / _ \\| __|"
echo " | (_| | (_) | (__|   <  __/ |  | |/ /  __/ (_| | | | | (_| | | | | (_| | (_) | |_) | (_) | |_ "
echo "  \\__,_|\\___/ \\___|_|\\_\\___|_|  |_/___\\___|\\__,_| |_|  \\__,_|_| |_|\\__,_|\\___/|_.__/ \\___/ \\__|"
echo "                                                                                               "
echo ""
echo ""
exec node gekko "$@"
