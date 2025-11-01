require 'csv'
file='scores.csv'

def add(name,score)
  CSV.open('scores.csv','a'){|f|f<<[Time.now,name,score]}
end

def top(n=5)
  rows=CSV.read('scores.csv',headers:false)
  puts rows.sort_by{|r|-r[2].to_i}.first(n).map{|r|"#{r[1]} => #{r[2]}"}
end

case ARGV[0]
when 'add' then add(ARGV[1],ARGV[2].to_i)
when 'top' then top(ARGV[1].to_i)
else puts "Usage: ruby scoreboard.rb add <name> <score> | top [n]"
end
