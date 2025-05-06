///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// storage-available by Stijn de Witt
// Detect if web storage is available and functional
// GitHub Repo: https://github.com/Download/storage-available
// Copyright (c) 2016 Stijn de Witt <StijnDeWitt@hotmail.com>
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

export function storageAvailable(type) {
	try {
		var storage = window[type],
			x = '__storage_test__';
		storage.setItem(x, x);
		storage.removeItem(x);
		return true;
	}
	catch(e) {
		return false;
	}
}