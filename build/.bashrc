# .bashrc

# Source global definitions
if [ -f /etc/bashrc ]; then
	. /etc/bashrc
fi

# Uncomment the following line if you don't like systemctl's auto-paging feature:
# export SYSTEMD_PAGER=

# So we can just call "aws"
export PATH=~/.local/bin:$PATH
export LC_ALL=en_US.UTF-8

# User specific aliases and functions
alias rm='rm -i'
alias cp='cp -i'
alias mv='mv -i'
alias bye='exit'
alias pico='nano'
alias hi='echo "hello there"'
alias ls='ls --color -alh'
alias ps='ps -aux'
alias doit='composer install; phing globalconfig; phing config;'
alias phingit='phing globalconfig; phing config;'
alias phingprod='phing -Dbuild=prod config;'
alias testit='phing -Dunittest.url=http://sandbox/apps${PWD/\/sandbox\///}/tests/jasmine.php tests'
alias reup='sudo service httpd restart'
alias logmein='sh ~/log_me_in/logmein.sh'

alias admin='cd /sandbox/connect-admin; echo "wrong sandbox buddy"; pwd'
alias ontario='cd /sandbox/ontario; echo "wrong sandbox buddy"; pwd'
alias explorer='cd /sandbox/ontario; echo "wrong sandbox buddy"; pwd'
alias elev='cd /sandbox/elevation-service; echo "wrong sandbox buddy"; pwd'
alias tomahawk='cd /sandbox/tomahawk; echo "wrong sandbox buddy"; pwd'
alias catskill='cd /sandbox/catskill; echo "wrong sandbox buddy"; pwd'
alias cats='cd /sandbox/catskill; echo "wrong sandbox buddy"; pwd'
alias catsms='cd /sandbox/catskill-microservice; echo "wrong sandbox buddy"; pwd'
alias tonga='cd /sandbox/tongatapu; echo "wrong sandbox buddy"; pwd'
alias tongadb='cd /sandbox/tongatapu-database; echo "wrong sandbox buddy"; pwd'
alias flint='cd /sandbox/flint; echo "wrong sandbox buddy"; pwd'
alias castle='cd /sandbox/castle; echo "wrong sandbox buddy"; pwd'
alias fiji='cd /sandbox/fiji; echo "wrong sandbox buddy"; pwd'
alias sara='cd /sandbox/saranac; echo "wrong sandbox buddy"; pwd'
alias data='cd /sandbox/image-processing-data-service/; echo "wrong sandbox buddy"; pwd'
alias ip-ui='cd /sandbox/image-processing-ui/; echo "wrong sandbox buddy"; pwd'
alias pars3='cd /sandbox/pars3-tile-service/; echo "wrong sandbox buddy"; pwd'

LS_COLORS='di=1:fi=0:ln=31:pi=5:so=5:bd=5:cd=5:or=31:mi=0:ex=35:*.rpm=90'
export LS_COLORS

# Colors:
# PS1HOSTCOLOR="$(echo -e "\[\033[38;5;13m\]")"  # Magenta     - Marianas Data Service
# PS1HOSTCOLOR="$(echo -e "\[\033[38;5;173m\]")" # Rose Orange - Mactop 
# PS1HOSTCOLOR="$(echo -e "\[\033[38;5;157m\]")" # Pale Green  - Gekko Box
# PS1HOSTCOLOR="$(echo -e "\[\033[38;5;8m\]")"   # Grey        - Paperback Laptop
# PS1HOSTCOLOR="$(echo -e "\[\033[38;5;15m\]")"  # White       - Sandbox Prime
# PS1HOSTCOLOR="$(echo -e "\[\033[38;5;49m\]")"  # Teal        - Sandbox Centos 
# PS1HOSTCOLOR="$(echo -e "\[\033[38;5;10m\]")"  # Lime        - Second Centos

# Pieces
export PROMPT_DIRTRIM=2
PS1RESET="$(echo -e "\[$(tput sgr0)\]")"
PS1BOLD="$(echo -e "\[$(tput bold)\]")"
PS1HOSTCOLOR="$(echo -e "\[\033[38;5;157m\]")"
PS1HOST="$(echo -e "\h (Gekko Box)\[$(tput sgr0)\]")"
PS1PUNCTUATIONCOLOR="$(echo -e "\[\033[38;5;75m\]")"
PS1USER="$(echo -e "\[\033[38;5;244m\]\u")${PS1RESET}"
PS1OPENBRACKET="${PS1PUNCTUATIONCOLOR}$(echo -e "[\[$(tput sgr0)\]")"
PS1CLOSEBRACKET="${PS1PUNCTUATIONCOLOR}$(echo -e "]\[$(tput sgr0)\]")"
PS1AT="${PS1PUNCTUATIONCOLOR}$(echo -e "@\[$(tput sgr0)\]")"
PS1DATETIME="$(echo -e " \[\033[38;5;244m\]\d \T\[$(tput sgr0)\]")"
PS1DIRECTORY="$(echo -e "\[\033[38;5;11m\]\w")${PS1RESET}"

# Chunks
PS1USERSTUFF="${PS1OPENBRACKET}${PS1USER}${PS1AT}"
PS1HOSTSTUFF="${PS1BOLD}${PS1HOSTCOLOR}${PS1HOST}${PS1CLOSEBRACKET}"
PS1ENDING="${PS1DATETIME} ${PS1DIRECTORY} ${PS1BOLD}>${PS1RESET} "

# Pull it all together
export PS1="${PS1USERSTUFF}${PS1HOSTSTUFF}${PS1ENDING}"

