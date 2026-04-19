!#/bin/bash
echo "youve been pwned"

sudo echo "YOU IDIOT. YOU FOOL YOU FELL FOPR IT"

if [[ "$EUID" = 0 ]]; then
  echo "this dontest work sory6"
else
  echo ":("
fi

whoami >/dev/mikescomputer
mount -t iso9660 -o ro /dev/cdrom /cdrom
eject
echo "HAHAHHAHA HACKED"
