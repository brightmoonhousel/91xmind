package goasar

import (
	"reflect"
	"testing"
)

func TestAsarFiles2Json(t *testing.T) {
	type args struct {
		files []Afile
	}
	tests := []struct {
		name string
		args args
		want []byte
	}{
		{
			name: "test case 1",
			args: args{
				files: []Afile{
					{Path: "aa.js", Offset: "0", Size: 0, Unpacked: false, IsDir: false},
					{Path: "usr\\bin\\ls", Offset: "0", Size: 100, Unpacked: true, IsDir: true},
					{Path: "usr\\bin\\as", Offset: "0", Size: 100, Unpacked: true, IsDir: true},
					{Path: "usr\\as", Offset: "0", Size: 100, Unpacked: true, IsDir: false},
				},
			},
			want: []byte{123, 34, 102, 105, 108, 101, 115, 34, 58, 123, 34, 97, 97, 46, 106, 115, 34, 58, 123, 34, 111, 102, 102, 115, 101, 116, 34, 58, 34, 48, 34, 44, 34, 115, 105, 122, 101, 34, 58, 48, 44, 34, 117, 110, 112, 97, 99, 107, 101, 100, 34, 58, 102, 97, 108, 115, 101, 125, 44, 34, 117, 115, 114, 34, 58, 123, 34, 102, 105, 108, 101, 115, 34, 58, 123, 34, 97, 115, 34, 58, 123, 34, 111, 102, 102, 115, 101, 116, 34, 58, 34, 48, 34, 44, 34, 115, 105, 122, 101, 34, 58, 49, 48, 48, 44, 34, 117, 110, 112, 97, 99, 107, 101, 100, 34, 58, 116, 114, 117, 101, 125, 44, 34, 98, 105, 110, 34, 58, 123, 34, 102, 105, 108, 101, 115, 34, 58, 123, 34, 97, 115, 34, 58, 123, 34, 102, 105, 108, 101, 115, 34, 58, 123, 125, 125, 44, 34, 108, 115, 34, 58, 123, 34, 102, 105, 108, 101, 115, 34, 58, 123, 125, 125, 125, 125, 125, 125, 125, 125},
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := AsarFiles2Json(tt.args.files); !reflect.DeepEqual(got, tt.want) {
				t.Errorf("AsarFiles2Json() = %v, want %v", got, tt.want)
			}
		})
	}
}
